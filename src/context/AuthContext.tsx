"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData, userStore, defaultUserData } from "@/lib/user-store";

interface AuthContextType {
    user: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = userStore.getUserData();
        // In a real app, we'd check a token here. For this mock, we'll assume logged in if data exists.
        setUser(data);
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        // Mock login delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // For mock, we just use the stored data or default
        const data = userStore.getUserData();
        setUser(data);
        setIsLoading(false);
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUser: UserData = {
            ...defaultUserData,
            profile: {
                id: Math.random().toString(36).substr(2, 9),
                name,
                email,
            }
        };
        userStore.saveUserData(newUser);
        setUser(newUser);
        setIsLoading(false);
    };

    const logout = () => {
        // We don't clear localStorage on logout in this mock so preferences persist for next "login"
        setUser(null);
    };

    const updateUser = (data: UserData) => {
        setUser(data);
        userStore.saveUserData(data);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
