import React, { ReactElement, useRef, useState } from "react";
import { Alert, ScrollView, TextInput as NativeTextInput, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, TextInput, Button, Text } from "@components";
import { Auth } from "aws-amplify";
import styles from "./login.styles";

type LoginProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Login">;
};

export default function Login({ navigation }: LoginProps): ReactElement {
    const passwordRef = useRef<NativeTextInput | null>(null);
    const [form, setForm] = useState({
        username: "text",
        password: "test1234"
    });
    const [loading, setLoading] = useState(false);

    const setFormInput = (key: keyof typeof form, value: string) =>
        setForm({ ...form, [key]: value });

    const login = async () => {
        setLoading(true);
        const { username, password } = form;
        try {
            await Auth.signIn(username, password);
            navigation.navigate("Home");
        } catch (e) {
            Alert.alert("Error", e.message || "Authentication failed");
        }

        setLoading(false);
    };

    return (
        <GradientBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <TextInput
                    value={form.username}
                    onChangeText={value => setFormInput("username", value)}
                    returnKeyType="next"
                    placeholder="Username"
                    style={{ marginBottom: 20 }}
                    onSubmitEditing={() => {
                        passwordRef.current?.focus();
                    }}
                />
                <TextInput
                    value={form.password}
                    onChangeText={value => setFormInput("password", value)}
                    ref={passwordRef}
                    style={{ marginBottom: 30 }}
                    returnKeyType="done"
                    secureTextEntry
                    placeholder="Password"
                />
                <Button loading={loading} title="Login" onPress={login} />
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <Text style={styles.registerLink}>Don&apos;t have an account?</Text>
                </TouchableOpacity>
            </ScrollView>
        </GradientBackground>
    );
}
