import React, { ReactElement } from "react";
import { AppBootstrap } from "@components";
import Navigator from "@config/navigator";
import { SettingsProvider } from "@contexts/settings.context";
import { AuthProvider } from "@contexts/auth-context";
import Amplify from "aws-amplify";
import config from "../aws-exports";

Amplify.configure(config);
// import { SettingsProvider } from "./contexts/settings.context";

export default function App(): ReactElement {
    return (
        <AuthProvider>
            <AppBootstrap>
                <SettingsProvider>
                    <Navigator />
                </SettingsProvider>
            </AppBootstrap>
        </AuthProvider>
    );
}
