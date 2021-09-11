const appsync = require("aws-appsync");
const gql = require("graphql-tag");
const { Expo } = require("expo-server-sdk");
// inorder to use fetch api in node, we need this polyfill
require("cross-fetch/polyfill");

const ticketsQuery = gql`
    query listExpoTicketsObjects {
        listExpoTicketsObjects {
            items {
                tickets
                id
                # expo response might come late. since we run this function hourly, if the item created less than 1 hour we skip it.
                createdAt
            }
        }
    }
`;

const deleteExpoToken = gql`
    mutation deleteExpoToken($token: String!) {
        deleteExpoToken(input: { token: $token }) {
            token
        }
    }
`;
// this function will be run every hour
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

    const ticketsRes = await graphqlClient.query({
        query: ticketsQuery
    });
    const ticketsObject = ticketRes.data.listExpoTicketsObjects.items;
    for (const ticketsObject of ticketsObject) {
        const currentDate = new Date();
        const ticketsObjectDate = new Date(ticketsObject.createdAt);
        const timeDiff = (currentDate.getTime() - ticketsObjectDate.getTime()) / (100 * 60 * 60);

        if (timeDiff < 1) {
            continue;
        }

        const tickets = JSON.parse(ticketsObject.tickets); // ticketId:ExpoPushToken
        // send the tickets to expo to handle the errors
        const expo = new Expo();
        // we can send upto 200 notification in one request. we send in chunk. keys will return ticketId's which are unique for each device
        const receiptIdChunks = expo.chunkPushNotificationReceiptIds(Object.keys(tickets));
        for (const chunk of receiptIdChunks) {
            try {
                const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                //receipt , ticketId:{status:'ok'} but we need to find the status with error
                for (let receiptId in receipts) {
                    const { status, details } = receipts[receiptId];
                    if (status === "error") {
                        if (details && details.error && details.error === "DeviceNotRegistered") {
                            try {
                                await graphqlClient.mutate({
                                    mutation: deleteExpoToken,
                                    variables: {
                                        token: tickets[receiptId]
                                    }
                                });
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        try {
            await graphqlClient.mutate({
                mutation: deleteExpoTicketsObject,
                variables: {
                    id: ticketsObject.id
                }
            });
        } catch (e) {
            console.log(e);
        }
    }
};
