import React, { ReactElement, useState, useEffect, useRef } from "react";
import {
    NavigationContainer,
    NavigationContainerRef,
    StackActions
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { createStackNavigator, StackNavigationOptions } from "@react-navigation/stack";
import {
    Home,
    SinglePlayerGame,
    Settings,
    Login,
    Signup,
    ChangePassword,
    ForgotPassword,
    MultiPlayerHome,
    MultiPlayerGame
} from "@screens";
import { colors } from "@utils";
import { useAuth } from "@contexts/auth-context";

export type StackNavigatorParams = {
    Home: undefined;
    SinglePlayerGame: undefined;
    Settings: undefined;
    Login: { redirect: keyof StackNavigatorParams } | undefined;
    Signup: { username: string } | undefined;
    ChangePassword: undefined;
    ForgotPassword: undefined;
    MultiPlayerHome: undefined;
    // we should be passing only one of them
    MultiPlayerGame:
        | { gameID: string; invitee?: undefined }
        | { invitee: string; gameID?: undefined };
};
// before navigation to the game, we need to make sure that navigator is loaded. if we receive notification and the app is killed and we click on the notification, and app is opened, and if we listened to event before the navigator is loaded, we will try to navigagte before the navigator is loaded.

const Stack = createStackNavigator<StackNavigatorParams>();

const navigatorOptions: StackNavigationOptions = {
    headerStyle: {
        backgroundColor: colors.purple,
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
            width: 0
        }
    },
    headerTintColor: colors.lightGreen,
    headerTitleStyle: {
        fontFamily: "DeliusUnicase_700Bold",
        fontSize: 20
    },
    headerBackTitleStyle: {
        fontFamily: "DeliusUnicase_400Regular",
        fontSize: 14
    }
};

export default function Navigator(): ReactElement {
    const { user } = useAuth();
    const navigatorRef = useRef<NavigationContainerRef | null>(null);
    const [isNavigatorReady, setIsNavigatorReady] = useState(false);

    useEffect(() => {
        if (user && isNavigatorReady) {
            // Notifications.addNotificationReceivedListener this will run when you clicked the notificatoin
            // this will run whne notification is clicked
            const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                console.log("response from addNotificationResponseReceivedListener", response);
                const gameID = response.notification.request.content.data.gameId;
                if (navigatorRef.current?.getCurrentRoute()?.name === "MultiPlayerGame") {
                    // navigatorRef does not have push and replace. they belong to stack navigator
                    navigatorRef.current.dispatch(
                        StackActions.replace("MultiPlayerGame", {
                            gameID
                        })
                    );
                } else {
                    navigatorRef.current?.navigate("MultiPlayerGame", {
                        gameID
                    });
                }
            });
            return () => {
                subscription.remove();
            };
        }
    }, [user, isNavigatorReady]);
    return (
        // make sure user is authenticated
        <NavigationContainer
            ref={navigatorRef}
            onReady={() => {
                setIsNavigatorReady(true);
            }}
        >
            {/* we pass headerMode="none"  to each screen as prop  */}
            <Stack.Navigator initialRouteName="Home" screenOptions={navigatorOptions}>
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Stack.Screen
                    name="SinglePlayerGame"
                    component={SinglePlayerGame}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="Login" component={Login} />
                {/* title is set automatically to name=Signup. we change it with options */}
                <Stack.Screen name="Signup" component={Signup} options={{ title: "Sign-Up" }} />
                <Stack.Screen
                    name="ChangePassword"
                    options={{ title: "Change Password" }}
                    component={ChangePassword}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    options={{ title: "Forgot Password" }}
                    component={ForgotPassword}
                />
                <Stack.Screen
                    name="MultiPlayerHome"
                    options={{ title: "Multi-Player" }}
                    component={MultiPlayerHome}
                />
                <Stack.Screen
                    name="MultiPlayerGame"
                    component={MultiPlayerGame}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
