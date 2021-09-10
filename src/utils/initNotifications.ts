import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import gql from "graphql-tag";
import { API, graphqlOperation } from "aws-amplify";

const addExpoToken = gql`
    mutation addExpoToken($token: String!) {
        addExpoToken(token: $token) {
            playerUsername
            token
        }
    }
`;

// this will invoked when user get authenticated which is app-bootstrap component
const initNotifications = async (): Promise<void> => {
    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            // device rejected notifications
            return;
        }
        const tokenRes = await Notifications.getExpoPushTokenAsync();
        // since user cannot mutate the token, we create lambda function to create tokens.
        console.log("token", tokenRes.data);
        try {
            await API.graphql(
                graphqlOperation(addExpoToken, {
                    token: tokenRes.data
                })
            );
        } catch (error) {
            console.log("error during addExpoToken mutaion ", error);
            // report error
        }
        // this is for android
        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX
            });
        }
    }
};

export default initNotifications;
