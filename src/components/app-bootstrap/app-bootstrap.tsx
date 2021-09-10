import React, { ReactElement, ReactNode, useState, useEffect } from "react";
import {
    useFonts,
    DeliusUnicase_400Regular,
    DeliusUnicase_700Bold
} from "@expo-google-fonts/delius-unicase";
import AppLoading from "expo-app-loading";
import { Auth, Hub } from "aws-amplify";
import { useAuth } from "@contexts/auth-context";
import { initNotifications } from "@utils";

type AppBootstrapProps = {
    children: ReactNode;
};

export default function AppBootstrap({ children }: AppBootstrapProps): ReactElement {
    const [fontLoaded] = useFonts({
        DeliusUnicase_400Regular,
        DeliusUnicase_700Bold
    });
    const [authLoaded, setAuthLoaded] = useState(false);
    const { setUser } = useAuth();

    useEffect(() => {
        async function checkCurrentUser() {
            try {
                // aws already stores the user in local storage. this method checks the local storage
                const user = await Auth.currentAuthenticatedUser();
                setUser(user);
                initNotifications();
            } catch (e) {
                console.log("error in checking user app-bootstrap", e);
                setUser(null);
            }
            setAuthLoaded(true);
        }
        try {
            checkCurrentUser();
        } catch (e) {
            console.log(e);
        }
        function hubListener(hubData: any) {
            const { data, event } = hubData.payload;
            switch (event) {
                case "signout":
                    setUser(null);
                    break;
                case "signIn":
                    setUser(data);
                    initNotifications();

                    break;

                default:
                    break;
            }
        }

        Hub.listen("auth", hubListener);
        return () => {
            Hub.remove("auth", hubListener);
        };
    }, []);

    return fontLoaded && authLoaded ? <>{children}</> : <AppLoading />;
}
