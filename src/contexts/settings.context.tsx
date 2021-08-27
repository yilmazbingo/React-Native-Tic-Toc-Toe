import React, {
    createContext,
    ReactElement,
    useContext,
    ReactNode,
    useState,
    useEffect
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const difficulties = { "1": "Beginner", "3": "Intermediate", "4": "Hard", "-1": "Impossible" };
type SettingsType = {
    // Since difficulties is not a type we use it as type with "typeof"
    difficulty: keyof typeof difficulties;
    haptics: boolean;
    sounds: boolean;
};

const defaultSettings: SettingsType = {
    difficulty: "-1",
    haptics: true,
    sounds: true
};

type SettingsContextType = {
    settings: SettingsType | null;
    loadSettings: () => void;
    saveSetting: <T extends keyof SettingsType>(settings: T, value: SettingsType[T]) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        // in case you wanna access conext outside the provider
        throw new Error("useSettings must be used within a Settigns Provider");
    }
    return context;
}

function SettingsProvider(props: { children: ReactNode }): ReactElement {
    const [settings, setSettings] = useState<SettingsType | null>(null);
    // const context = useSettings();  this was returning "useSettings must be used within a Settigns Provider"

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem("@settings");
            settings !== null ? setSettings(JSON.parse(settings)) : setSettings(defaultSettings);
        } catch (error) {
            setSettings(defaultSettings);
        }
    };

    const saveSetting = async <T extends keyof SettingsType>(
        setting: T,
        value: SettingsType[T]
    ) => {
        try {
            const oldSettings = settings ? settings : defaultSettings;
            const newSettings = { ...oldSettings, [setting]: value };
            await AsyncStorage.setItem("@settings", JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            Alert.alert("Error during loading async storage");
            console.log("error during loding async storage", error);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return <SettingsContext.Provider {...props} value={{ settings, saveSetting, loadSettings }} />;
}

// SettingsProvider is used inside index.tsx to wrap components
// useSettings is used inside the components that needs to accesss to this context.
export { useSettings, SettingsProvider, difficulties };
