import React, { ReactElement, useState } from "react";
import { ScrollView, View, Image, Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, Button, Text } from "@components";
import { useAuth } from "@contexts/auth-context";
import { signOut } from "@utils";
import styles from "./home.styles";

type HomeProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Home">;
};

export default function Home({ navigation }: HomeProps): ReactElement {
    // we could use setUser(null) when signout but aws-amplify has Hub which listens to certain events in aws
    // we use Hub in appBootstrap component

    const { user } = useAuth();

    const [signingOut, setSigningOut] = useState(false);
    return (
        <GradientBackground>
            {/*  ScrollView has 2 parts. container and content. style is applied to container, contentContainer */}
            <ScrollView contentContainerStyle={styles.container}>
                <Image style={styles.logo} source={require("@assets/logo.png")} />
                <View style={styles.buttons}>
                    <Button
                        onPress={() => navigation.navigate("SinglePlayerGame")}
                        style={styles.button}
                        title="SinglePlayer"
                    />
                    <Button
                        style={styles.button}
                        onPress={() => {
                            if (user) {
                                navigation.navigate("MultiPlayerHome");
                            } else {
                                navigation.navigate("Login", { redirect: "MultiPlayerHome" });
                            }
                        }}
                        title="MultiPlayer"
                    />
                    <Button
                        loading={signingOut}
                        style={styles.button}
                        onPress={async () => {
                            if (user) {
                                setSigningOut(true);
                                try {
                                    await Auth.signOut();
                                } catch (error) {
                                    console.log("error in signingout ", error);
                                    Alert.alert("Error!", "Error signing out!");
                                }
                                setSigningOut(false);
                            } else {
                                navigation.navigate("Login");
                            }
                        }}
                        title={user ? "Logout" : "login"}
                    />
                    <Button
                        style={styles.button}
                        onPress={() => {
                            navigation.navigate("Settings");
                        }}
                        title="Setting"
                    />
                    {user && (
                        <Text weight="400" style={styles.loggedIn}>
                            Logged in as <Text weight="700">{user.username}</Text>{" "}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </GradientBackground>
    );
}
