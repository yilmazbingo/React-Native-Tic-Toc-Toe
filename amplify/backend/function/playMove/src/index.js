// in appSync we can write mutations to trigger lambda functions
const appsync = require("aws-appsync");
const gql = require("graphql-tag");
// inorder to use fetch api in node, we need this polyfill
require("cross-fetch/polyfill");
const isTerminal = require("./isTerminal");
const getGame = gql`
    query getGame($id: ID!) {
        getGame(id: $id) {
            id
            turn
            state
            status
            winner
            owners
            initiator
        }
    }
`;

const updateGame = gql`
    mutation updateGame(
        $id: ID!
        $turn: String!
        $winner: String!
        $status: GameStatus!
        $state: [Symbol]!
        $player: String!
    ) {
        updateGame(
            input: { id: $id, turn: $turn, winner: $winner, status: $status, state: $state }
            condition: { turn: { eq: $player } }
        ) {
            id
            turn
            state
            status
            winner
        }
    }
`;

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
    const player = event.identity.username;
    // we called the argument game in mutation
    const gameID = event.arguments.game;
    const index = event.arguments.game;
    console.log(player, gameID, index);
    //  get our game object from id, make sure it exists
    const gameResponse = await graphqlClient.query({
        query: getGame,
        variables: {
            id: gameID
        }
    });
    console.log("gameResponse", gameResponse);
    const game = gameResponse.data.getGame;
    if (!game) {
        throw new Error("Game not found");
    }
    // make sure the game is active. it is either DECLINED, FINISHED,CANCELLED
    if (game.status !== "REQUESTED" && game.status !== "ACTIVE") {
        console.log("Game is not active!");
        throw new Error("Game is not active!");
    }

    // check that the current user is a participiant in the game and it is his turn
    if (!game.owners.includes(player)) {
        console.log("Logged in player is not participating in this game");

        throw new Error("Logged in player is not participating in this game");
    }
    if (game.turn !== player) {
        console.log("It is not your turn");
        throw new Error("It is not your turn");
    }
    // make sure that the index is valid. index<=8 and not already occupied
    if (index > 8 || game.state[index]) {
        console.log("Invalid index or cell is already occupied");
        throw new Error("Invalid index or cell is already occupied");
    }
    // update the state, check if the moce is a terminal one and update the winner, status, turn to the next player
    const symbol = player === game.initiator ? "x" : "o";
    const nextTurn = game.owners.find(p => p !== game.turn);
    const invitee = game.owners.find(p => p !== game.initiator);
    const newState = [...game.state];
    newState[index] = symbol;
    let newStatus = "ACTIVE";
    let newWinner = null;
    const terminalState = isTerminal(newState);
    if (terminalState) {
        newStatus = "FINISHED";
        if (terminalState.winner === "x") {
            newWinner = game.initiator;
        }
        if (terminalState.winner === "o") {
            newWinner = invitee;
        }
    }
    const updateGameResponse = await graphqlClient.mutate({
        mutation: updateGame,
        variables: {
            id: gameID,
            turn: nextTurn,
            winner: newWinner,
            status: newStatus,
            state: newState,
            player: player
        }
    });
    // return updated game
    return updateGameResponse.data.updateGame;
};
