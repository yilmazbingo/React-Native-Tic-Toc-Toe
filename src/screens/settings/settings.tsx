import React, { ReactElement, useState } from "react";
import { ScrollView, View, TouchableOpacity, Switch } from "react-native";
import { GradientBackground, Text } from "@components";
import styles from "./settings.styles";
import { colors } from "@utils";
// import { difficulties, useSettings } from "@contexts/settings-context";
// import { useAuth } from "@contexts/auth-context";
import { StackNavigatorParams } from "@config/navigator";
import { StackNavigationProp } from "@react-navigation/stack";

type SettingsScreenNavigationProp = StackNavigationProp<StackNavigatorParams, "Settings">;

type SettingsProps = {
    navigation: SettingsScreenNavigationProp;
};

export default function Settings({ navigation }: SettingsProps): ReactElement | null {
    const [setting, setSetting] = useState(false);
    // const { user } = useAuth();
    const difficulties = { "1": "Beginner", "3": "Intermediate", "4": "Hard", "-1": "Impossible" };

    return (
        <GradientBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.field}>
                    <Text style={styles.label}>Bot Difficulty</Text>
                    <View style={styles.choices}>
                        {Object.keys(difficulties).map(level => {
                            return (
                                <TouchableOpacity style={styles.choice} key={level}>
                                    <Text style={styles.choiceText}>
                                        {/* type of difficulties will be the object itslef */}
                                        {difficulties[level as keyof typeof difficulties]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={[styles.field, styles.switchField]}>
                    <Text style={styles.label}>Sounds</Text>
                    <Switch
                        trackColor={{
                            false: colors.purple,
                            true: colors.lightPurple
                        }}
                        thumbColor={colors.lightGreen}
                        ios_backgroundColor={colors.purple}
                        value={setting}
                        onValueChange={() => setSetting(!setting)}
                    />
                </View>
                <View style={[styles.field, styles.switchField]}>
                    <Text style={styles.label}>Haptics/Vibrations</Text>
                    <Switch
                        trackColor={{
                            false: colors.purple,
                            true: colors.lightPurple
                        }}
                        thumbColor={colors.lightGreen}
                        ios_backgroundColor={colors.purple}
                        value={setting}
                        onValueChange={() => setSetting(!setting)}
                    />
                </View>
            </ScrollView>
        </GradientBackground>
    );
}
