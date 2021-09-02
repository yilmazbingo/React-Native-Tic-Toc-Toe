// in appSync we can write mutations to trigger lambda functions
const appsync = require("aws-appsync");
const gql = require("graphql-tag");
// inorder to use fetch api in node, we need this polyfill
require("cross-fetch/polyfill");

exports.handler = async event => {
    const graphqlClient = new appsync.AWSAppSyncClient({
        url: process.env.API_TICTOCTOE_GRAPHQLAPIENDPOINTOUTPUT,
        region: process.env.REGION,
        auth: {
            type: "AWS_IAM",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                sessionToken: process.env.AWS_SESSION_TOKEN
            }
        },
        disableOffline: true
    });
    // console.log("event", event);
    const initiator = event.identity.username;
    const invitee = event.arguments.invitee;
    // Make sure initiator and invitee exists in db
    const playerQuery = gql`
        query getPlayer($username: String!) {
            getPlayer(username: $username) {
                id
            }
        }
    `;

    const initiatorResponse = await graphqlClient.query({
        query: playerQuery,
        variables: { username: initiator }
    });
    const inviteeResponse = await graphqlClient.query({
        query: playerQuery,
        variables: { username: invitee }
    });

    if (!initiatorResponse.data.getPlayer || !inviteeResponse.data.getPlayer) {
        throw new Error("At least 1 player does not exist");
    }
    if (initiatorResponse.data.getPlayer.id === inviteeResponse.data.getPlayer.id) {
        throw new Error("Initiator cannot inivite itself");
    }
    //Creting a new game object
    const gameMutation = gql`
        mutation createGame(
            $status: GameStatus!
            $owners: [String!]!
            $initiator: String!
            $turn: String!
            $state: [Symbol]!
        ) {
            createGame(
                input: {
                    status: $status
                    owners: $owners
                    initiator: $initiator
                    turn: $turn
                    state: $state
                }
            ) {
                id
                state
                status
                turn
                winner
            }
        }
    `;

    const gameResponse = await graphqlClient.mutate({
        mutation: gameMutation,
        variables: {
            status: "REQUESTED",
            owners: [initiator, invitee],
            initiator,
            turn: Math.random() < 0.5 ? initiator : invitee,
            state: [null, null, null, null, null, null, null, null, null]
        }
    });
    // Linking the game with players (by creating a playerGame model)
    const playerGameMutation = gql`
        mutation createPlayerGame($gameID: ID!, $playerUsername: String!, $owners: [String!]!) {
            createPlayerGame(
                input: { gameID: $gameID, playerUsername: $playerUsername, owners: $owners }
            ) {
                id
            }
        }
    `;

    //    link the initator with the game
    const initiatorPlayerGameResponse = await graphqlClient.mutate({
        mutation: playerGameMutation,
        variables: {
            gameID: gameResponse.data.createGame.id,
            playerUsername: initiator,
            owners: [initiator, invitee]
        }
    });
    //   link the invitee with the game
    const inviteePlayerGameResponse = await graphqlClient.mutate({
        mutation: playerGameMutation,
        variables: {
            gameID: gameResponse.data.createGame.id,
            playerUsername: invitee,
            owners: [initiator, invitee]
        }
    });
    // send push notification to the invitee
    return {
        id: gameResponse.data.createGame.id,
        status: gameResponse.data.createGame.status,
        turn: gameResponse.data.createGame.turn,
        state: gameResponse.data.createGame.state,
        winner: gameResponse.data.createGame.winner
    };
};
