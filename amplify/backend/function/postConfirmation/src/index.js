// apssync uses fetch api, inorder for fetch work, we need to requie the polyfill
const appsync = require("aws-appsync");
const gql = require("graphql-tag");
// inorder to use fetch api in node, we need this polyfill
require("cross-fetch/polyfill");

// callback will return the result to cognito
exports.handler = async (event, context, callback) => {
    //    console.log("env",process.env) all env variables will be logged into cloudwatch
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
        //    this setting is for client setting to cache. since we are on the server we do not need to cache
        disableOffline: true
    });

    const mutation = gql`
        mutation createPlayer(
            $name: String!
            $cognitoID: String!
            $username: String!
            $email: AWSEmail!
        ) {
            # this is already set by aws server
            createPlayer(
                input: { cognitoID: $cognitoID, email: $email, name: $name, username: $username }
            ) {
                id
            }
        }
    `;

    try {
        await graphqlClient.mutate({
            mutation,
            variables: {
                name: event.request.userAttributes.name,
                username: event.userName,
                cognitoID: event.request.userAttributes.sub,
                email: event.request.userAttributes.email
            }
        });
        callback(null, event);
    } catch (error) {
        callback(error);
    }
};
