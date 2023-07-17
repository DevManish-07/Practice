import React, { createContext, useContext, useState } from "react";
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from "../firebase";

type AuthProviderProps = {
    children: React.ReactNode
}

export interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null | { email: string };
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoggedIn: boolean;
    isiPhone12: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = (props: AuthProviderProps) => {
    const [user, setUser] = useState<User | null | { email: string }>({ email: "Me@gmail.com" });
    const [isLoggedIn, setisLoggedIn] = useState<boolean>(false);
    const isiPhone12 = true;
    // const isiPhone12 = /iPhone\s/.test(navigator.userAgent);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setisLoggedIn(false);
        } catch (error) {
            console.log(error);
        }
    };

    const login = async (email: string, password: string) => {
        if (isiPhone12) {

            try {
                const { user } = await signInWithEmailAndPassword(auth, email, password);
                if (user) {
                    setUser({ id: user.uid, email: user.email!, name: user.displayName! });
                    setisLoggedIn(true);
                }
            } catch (error) {
                setisLoggedIn(false);
                console.log(error);
            }
        } else {
            console.log("You are not a iphone user")
        }

    };

    console.log(user);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isiPhone12 }}>
            {props.children}
        </AuthContext.Provider>
    );
};


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
