import React, { ReactElement, useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    TextInput as NativeTextInput,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { StackNavigationProp, useHeaderHeight } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, TextInput, Button } from "@components";
import { Auth } from "aws-amplify";
import styles from "./signup.styles";

type SignupProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Login">;
};

export default function Signup({ navigation }: SignupProps): ReactElement {
    const passwordRef = useRef<NativeTextInput | null>(null);
    const emailRef = useRef<NativeTextInput | null>(null);
    const nameRef = useRef<NativeTextInput | null>(null);
    const [form, setForm] = useState({
        username: "text",
        password: "test1234",
        email: "",
        name: ""
    });
    const [loading, setLoading] = useState(false);
    const headerHeight = useHeaderHeight();

    const setFormInput = (key: keyof typeof form, value: string) =>
        setForm({ ...form, [key]: value });

    const signUp = async () => {
        setLoading(true);
        const { username, password, email, name } = form;
        try {
            await Auth.signUp({
                username,
                password,
                attributes: { email, name }
            });
            navigation.navigate("Home");
        } catch (e) {
            Alert.alert("Error", e.message || "Authentication failed");
            console.log("error in signup", e);
        }

        setLoading(false);
    };

    return (
        <GradientBackground>
            {/* KeyboardAvoidingView is to avoid the keyboard if the screen is smaller. it will shift the form up  */}
            {/* keyboardVerticalOffset is the heigh of header. because our form placed right after header */}
            {/* behaviour padding best works for ios, height best works for android */}
            <KeyboardAvoidingView
                keyboardVerticalOffset={headerHeight}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <TextInput
                        value={form.username}
                        onChangeText={value => setFormInput("username", value)}
                        returnKeyType="next"
                        placeholder="Username"
                        style={{ marginBottom: 20 }}
                        onSubmitEditing={() => {
                            nameRef.current?.focus();
                        }}
                    />
                    <TextInput
                        ref={nameRef}
                        value={form.name}
                        onChangeText={value => setFormInput("name", value)}
                        returnKeyType="next"
                        placeholder="Name"
                        style={{ marginBottom: 20 }}
                        onSubmitEditing={() => {
                            passwordRef.current?.focus();
                        }}
                    />
                    <TextInput
                        keyboardType="email-address"
                        ref={emailRef}
                        value={form.email}
                        onChangeText={value => setFormInput("email", value)}
                        returnKeyType="next"
                        placeholder="Email"
                        style={{ marginBottom: 20 }}
                        onSubmitEditing={() => {
                            emailRef.current?.focus();
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
                    <Button loading={loading} title="Signup" onPress={signUp} />
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}
