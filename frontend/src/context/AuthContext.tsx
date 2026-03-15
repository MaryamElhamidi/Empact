"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData, userStore, defaultUserData } from "@/lib/user-store";
import { api } from "@/lib/api";

interface AuthContextType {
    user: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, locations: string[], causes: string[]) => Promise<void>;
    logout: () => void;
    updateUser: (data: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function backendUserToUserData(backend: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    interests?: string[];
    locations?: string[];
}): UserData {
    return {
        profile: {
            id: String(backend.user_id),
            name: [backend.first_name, backend.last_name].filter(Boolean).join(" ") || backend.email,
            email: backend.email,
            locations: backend.locations ?? [],
            causes: backend.interests ?? [],
        },
        preferences: defaultUserData.preferences,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") {
            setIsLoading(false);
            return;
        }
        const userId = localStorage.getItem("empact_user_id");
        if (!userId) {
            userStore.reset();
            setUser(null);
            setIsLoading(false);
            return;
        }
        const data = userStore.getUserData();
        if (data?.profile?.id && String(data.profile.id) === userId) {
            setUser(data);
        } else {
            setUser(null);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const result = await api.login(email, password);
            if (!result.success || result.user_id == null) {
                throw new Error("Invalid email or password");
            }
            const backendUser = await api.getUserByEmail(email);
            const userData = backendUserToUserData(backendUser);
            userStore.saveUserData(userData);
            if (typeof window !== "undefined") {
                localStorage.setItem("empact_user_id", String(backendUser.user_id));
                localStorage.setItem("empact_email", email);
            }
            setUser(userData);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, locations: string[], causes: string[]) => {
        setIsLoading(true);
        try {
            const parts = name.trim().split(/\s+/);
            const firstName = parts[0] ?? "";
            const lastName = parts.slice(1).join(" ") ?? "";
            await api.createUser({
                firstName,
                lastName,
                email,
                password,
                interests: causes.slice(0, 3),
                locations: locations.slice(0, 3),
            });
            const backendUser = await api.getUserByEmail(email);
            const userData = backendUserToUserData(backendUser);
            userStore.saveUserData(userData);
            if (typeof window !== "undefined") {
                localStorage.setItem("empact_user_id", String(backendUser.user_id));
                localStorage.setItem("empact_email", email);
            }
            api.createNotification(backendUser.user_id, {
                type: "GENERAL",
                title: "Welcome to EmPact!",
                message: "We're glad to have you here. Start exploring humanitarian opportunities in the Discover tab.",
                target: "Welcome"
            }).catch(() => { });
            setUser(userData);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("empact_user_id");
            localStorage.removeItem("empact_email");
        }
        userStore.reset();
    };

    const updateUser = (data: UserData) => {
        const userId = Number(data.profile.id);
        const oldTwoFactor = user?.preferences.twoFactorEnabled;
        const newTwoFactor = data.preferences.twoFactorEnabled;

        setUser(data);
        userStore.saveUserData(data);

        if (userId && oldTwoFactor !== newTwoFactor) {
            api.createNotification(userId, {
                type: "SYSTEM_UPDATE",
                title: newTwoFactor ? "2FA Enabled" : "2FA Disabled",
                message: newTwoFactor
                    ? "Two-factor authentication has been successfully enabled for your account."
                    : "Two-factor authentication has been disabled. We recommend keeping it on for better security.",
                target: "Security"
            }).catch(() => { });
        }
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
