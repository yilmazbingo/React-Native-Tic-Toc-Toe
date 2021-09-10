import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

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
        console.log(tokenRes);
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
