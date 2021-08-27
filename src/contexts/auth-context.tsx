import React, { createContext, ReactElement, ReactNode, useContext, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextType = {
    user: { [key: string]: string } | null;
    setUser: React.Dispatch<
        React.SetStateAction<{
            [key: string]: any;
        } | null>
    >;
};

function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

const AuthProvider = (props: { children: ReactNode }): ReactElement => {
    const [user, setUser] = useState<{ [key: string]: any } | null>(null);

    return <AuthContext.Provider {...props} value={{ user, setUser }}></AuthContext.Provider>;
};

export { AuthProvider, useAuth };
