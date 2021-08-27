// forwardRef will forward the ref from Login to NativeTextInput
import React, { ReactElement, forwardRef } from "react";
import { TextInput as NativeTextInput, StyleSheet, TextInputProps } from "react-native";
import { colors } from "@utils";

const styles = StyleSheet.create({
    input: {
        height: 50,
        width: "100%",
        borderBottomWidth: 1,
        borderColor: colors.lightGreen,
        backgroundColor: colors.purple,
        color: colors.lightGreen,
        fontFamily: "DeliusUnicase_400Regular"
    }
});

// we pass returning component NativeTextInput and prop types
const TextInput = forwardRef<NativeTextInput, TextInputProps>(
    ({ style, ...props }: TextInputProps, ref): ReactElement => {
        return (
            <NativeTextInput
                ref={ref}
                {...props}
                placeholderTextColor="#5d5379"
                style={[styles.input, style]}
            />
        );
    }
);

// Component definition is missing display name, if I do not define component separately. it helps for debugging

TextInput.displayName = "TextInput";

export default TextInput;
