import React, { ReactElement } from "react";
import { NavigationContainer } from "@react-navigation/native";
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
    return (
        <NavigationContainer>
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
