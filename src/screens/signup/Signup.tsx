import React, { ReactElement, useRef, useState, useEffect } from "react";
import {
    Alert,
    ScrollView,
    TextInput as NativeTextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp, useHeaderHeight } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, TextInput, Button, Text } from "@components";
import { Auth } from "aws-amplify";
import OTPInput from "@twotalltotems/react-native-otp-input";
import styles from "./signup.styles";
import { colors } from "@utils";
import { TouchableOpacity } from "react-native-gesture-handler";

type SignupProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Login">;
    route: RouteProp<StackNavigatorParams, "Signup">;
};

// if user is unconfirmed, we redirect it here with "username" and we access it by route
export default function Signup({ navigation, route }: SignupProps): ReactElement {
    const unconfirmedUsername = route?.params?.username;
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
    const [step, setStep] = useState<"signUp" | "otp">(unconfirmedUsername ? "otp" : "signUp");
    const [confirming, setConfirming] = useState(false);
    const [resending, setResending] = useState(false);

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
            setStep("otp");
        } catch (e) {
            Alert.alert("Error", e.message || "Authentication failed");
        }

        setLoading(false);
    };

    const confirmCode = async (code: string) => {
        setConfirming(true);
        try {
            await Auth.confirmSignUp(form.username || unconfirmedUsername || "", code);
            navigation.navigate("Login");
            Alert.alert("Success", "You can now login");
        } catch (e) {
            Alert.alert("Error", e.message || "Authentication failed");
        }
        setConfirming(false);
    };
    const resendCode = async (username: string) => {
        setResending(true);
        try {
            await Auth.resendSignUp(username);
        } catch (e) {
            Alert.alert("Error", e.message || "Authentication failed");
        }
        setResending(false);
    };

    useEffect(() => {
        if (unconfirmedUsername) {
            resendCode(unconfirmedUsername);
        }
    }, []);

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
                    {step === "otp" && (
                        <>
                            <Text style={styles.otpText}>Enter the code</Text>
                            {confirming ? (
                                <ActivityIndicator color={colors.lightGreen} />
                            ) : (
                                <>
                                    <OTPInput
                                        placeholderTextColor="#%d5379"
                                        placeholderCharacter="0"
                                        pinCount={6}
                                        codeInputFieldStyle={styles.otpInputBox}
                                        codeInputHighlightStyle={styles.otpActivaInputBox}
                                        onCodeFilled={code => {
                                            confirmCode(code);
                                        }}
                                    />
                                    {resending ? (
                                        <ActivityIndicator color={colors.lightGreen} />
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (form.username) {
                                                    resendCode(form.username);
                                                } else if (unconfirmedUsername) {
                                                    resendCode(unconfirmedUsername);
                                                }
                                            }}
                                        >
                                            <Text style={styles.resendLink}>Resend Code</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </>
                    )}
                    {step === "signUp" && (
                        <>
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
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}
