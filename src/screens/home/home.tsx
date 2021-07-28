import React, { ReactElement } from "react";
import { ScrollView, View, Image } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, Button } from "@components";
import styles from "./home.styles";

type HomeProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Home">;
};

export default function Home({ navigation }: HomeProps): ReactElement {
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
                    <Button style={styles.button} title="MultiPlayer" />
                    <Button style={styles.button} title="Login" />
                    <Button style={styles.button} title="Setting" />
                </View>
            </ScrollView>
        </GradientBackground>
    );
}
