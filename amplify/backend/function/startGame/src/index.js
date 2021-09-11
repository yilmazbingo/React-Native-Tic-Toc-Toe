// in appSync we can write mutations to trigger lambda functions
const appsync = require("aws-appsync");
const gql = require("graphql-tag");
const { Expo } = require("expo-server-sdk");
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
    // Make sure initiator and invitee exists in db. tokens is array. so we have items
    const playerQuery = gql`
        query getPlayer($username: String!) {
            getPlayer(username: $username) {
                id
                tokens {
                    items {
                        token
                    }
                }
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
    const inviteeTokens = inviteeResponse.data.getPlayer.tokens.items;
    const expo = new Expo();
    const messages = [];

    for (let pushToken of inviteeTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            continue;
        }
        messages.push({
            to: pushToken.token,
            sound: "default",
            body: `${initiator} invited you to play a game!`,
            data: { gameId: gameResponse.data.createGame.id },
            //  since i do not store the notificaton on db, I cannot count unread messages count
            badge: 1
        });
    }
    // expo allows us to send upt0 200 messages in each request. in this case divide it into 2.
    // chunks contains array of arrays
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (let chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            for (let index = 0; index < ticketChunk.length; index++) {
                const ticket = ticketChunk[index];
                const expoToken = chunk[index].to;
                tickets.push({
                    expoToken,
                    ticket
                });
            }
        } catch (e) {
            console.log(e);
            // error reporting service
        }
    }

    const ticketIds = {};

    // delete the tickets that give errror:
    for (let ticketObj of tickets) {
        const ticket = ticketObj.ticket;
        const expoToken = ticketObj.expoToken;
        if (ticket.status === "error") {
            if (ticket.details && ticket.details.error && error === "DeviceNotRegistered") {
                const deleteExpoToken = gql`
                    mutation deleteExpoToken($token: String!) {
                        deleteExpoToken(input: { token: $token }) {
                            token
                        }
                    }
                `;
                try {
                    await graphqlClient.mutate({
                        mutation: deleteExpoToken,
                        variables: {
                            token: expoToken
                        }
                    });
                } catch (e) {
                    // error reporting service
                    console.log(e);
                }
            }
            if (ticket.id) {
                ticketIds[ticket.id] = expoToken;
            }
        }
    }

    if (Object.keys(ticketIds).length !== 0) {
        const createExpoTicketsObject = gql`
            mutation createExpoTicketsObject($tickets: AWSJSON!) {
                createExpoTicketsObject(input: { tickets: $tickets }) {
                    id
                    tickets
                }
            }
        `;

        try {
            await graphqlClient.mutate({
                mutation: createExpoTicketsObject,
                variables: {
                    tickets: JSON.stringify(ticketIds)
                }
            });
        } catch (error) {
            // report error service
            console.log("error in inserting tickets to db", error);
        }
    }
    return {
        id: gameResponse.data.createGame.id,
        status: gameResponse.data.createGame.status,
        turn: gameResponse.data.createGame.turn,
        state: gameResponse.data.createGame.state,
        winner: gameResponse.data.createGame.winner
    };
};
