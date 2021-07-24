import React, { ReactElement } from "react";
import { Text, Button, ScrollView, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground } from "@components";
import styles from "./home.styles";

type HomeProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Home">;
};

export default function Home({ navigation }: HomeProps): ReactElement {
    return (
        <GradientBackground>
            {/*  ScrollView has 2 parts. container and content. style is applied to container, contentContainer */}
            <ScrollView contentContainerStyle={styles.container}>
                <Text>Home</Text>
                <Button title="Game" onPress={() => navigation.navigate("Game")} />
            </ScrollView>
        </GradientBackground>
    );
}
