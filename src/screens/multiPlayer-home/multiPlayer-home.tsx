import React, { ReactElement } from "react";
import { ScrollView, View } from "react-native";
import { GradientBackground, Text } from "@components";
import { useAuth } from "@contexts/auth-context";
import styles from "./multiPlayer-home.styles";
import { colors } from "@utils";

export default function multiPlayerHome(): ReactElement {
    const { user } = useAuth();
    return (
        <GradientBackground>
            {user ? (
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={{ color: colors.lightGreen }}> {user.username}</Text>
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    <Text style={{ color: colors.lightGreen }}> You must be logged in</Text>
                </View>
            )}
        </GradientBackground>
    );
}
