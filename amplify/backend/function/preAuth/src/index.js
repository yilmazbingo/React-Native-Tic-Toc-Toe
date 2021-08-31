// if user is not saved into dynamodb but created in cognito, user can still log in. we dont want that
const appsync = require("aws-appsync");
const gql = require("graphql-tag");
// inorder to use fetch api in node, we need this polyfill
require("cross-fetch/polyfill");

// exports.handler = async (event, context, callback) => {
//     //    console.log("env",process.env) all env variables will be logged into cloudwatch
//     const graphqlClient = new appsync.AWSAppSyncClient({
//         url: process.env.API_TICTOCTOE_GRAPHQLAPIENDPOINTOUTPUT,
//         region: process.env.REGION,
//         auth: {
//             type: "AWS_IAM",
//             credentials: {
//                 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//                 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//                 sessionToken: process.env.AWS_SESSION_TOKEN
//             }
//         },
//         disableOffline: true
//     });

//     const query = gql`
//         query getPlayer($username: String!) {
//             getPlayer(username: $username) {
//                 id
//             }
//         }
//     `;
//     const mutation = gql`
//         mutation createPlayer(
//             $name: String!
//             $cognitoID: String!
//             $username: String!
//             $email: AWSEmail!
//         ) {
//             createPlayer(
//                 input: { cognitoID: $cognitoID, email: $email, name: $name, username: $username }
//             ) {
//                 id
//             }
//         }
//     `;
//     try {
//         const response = await graphqlClient.query({
//             query,
//             variables: { username: event.userName }
//         });
//         if (response.data.getPlayer) {
//             callback(null, event);
//         } else {
//             try {
//                 await graphqlClient.mutate({
//                     mutation,
//                     variables: {
//                         name: event.request.userAttributes.name,
//                         username: event.userName,
//                         cognitoID: event.request.userAttributes.sub,
//                         email: event.request.userAttributes.email
//                     }
//                 });
//                 callback(null, event);
//             } catch (error) {
//                 callback(error);
//             }
//         }
//     } catch (e) {
//         callback(e);
//     }
// };

exports.handler = async (event, context, callback) => {
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

    const query = gql`
        query getPlayer($username: String!) {
            getPlayer(username: $username) {
                id
            }
        }
    `;

    const mutation = gql`
        mutation createPlayer(
            $name: String!
            $cognitoID: String!
            $username: String!
            $email: AWSEmail!
        ) {
            createPlayer(
                input: { cognitoID: $cognitoID, email: $email, name: $name, username: $username }
            ) {
                id
            }
        }
    `;

    try {
        const response = await graphqlClient.query({
            query,
            variables: {
                username: event.userName
            }
        });
        if (response.data.getPlayer) {
            callback(null, event);
        } else {
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
        }
    } catch (error) {
        callback(error);
    }
};
