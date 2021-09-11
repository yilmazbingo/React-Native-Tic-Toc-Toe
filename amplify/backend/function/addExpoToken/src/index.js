const appsync = require("aws-appsync");
const gql = require("graphql-tag");
// inorder to use fetch api in node, we need this polyfill
require("cross-fetch/polyfill");

const getExpoToken = gql`
    query getExpoToken($token: String!) {
        # token is the primary key.
        getExpoToken(token: $token) {
            id
            token
            playerUsername
        }
    }
`;

const createExpoToken = gql`
    mutation createExpoToken($token: String!, $playerUsername: String!) {
        createExpoToken(input: { token: $token, playerUsername: $playerUsername }) {
            id
            token
            playerUsername
        }
    }
`;

const updateExpoToken = gql`
    mutation updateExpoToken($id: ID!, $token: String!, $playerUsername: String!) {
        updateExpoToken(input: { id: $id, token: $token, playerUsername: $playerUsername }) {
            id
            token
            playerUsername
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
    // name of the logged in  user
    const player = event.identity.username;
    // check if token already exist and has the logged in user as the user
    const tokenRes = await graphqlClient.query({
        query: getExpoToken,
        // this function will be triggered by a mutation and we access the arg of that mutation
        variables: { token: event.arguments.token }
    });

    const tokenObj = tokenRes.data.getExpoToken;
    if (tokenObj) {
        if (tokenObj.playerUsername === player) {
            return tokenObj;
        }
    }

    // if token exists but it belongs to another user.  Incase an error happended and when user logged out, token was not removed. update the token

    if (tokenObj) {
        if (tokenObj.playerUsername === player) {
            return tokenObj;
        } else {
            const updateTokenRes = await graphqlClient.mutate({
                mutation: updateExpoToken,
                variables: { id: tokenObj.id, token: tokenObj.token, playerUsername: player }
            });
            return updateTokenRes.data.updateExpoToken;
        }
    } else {
        // if the token does not exist.
        const createTokenRes = await graphqlClient.mutate({
            mutation: createExpoToken,
            variables: {
                token: event.arguments.token,
                playerUsername: player
            }
        });
        return createTokenRes.data.createExpoToken;
    }
};
