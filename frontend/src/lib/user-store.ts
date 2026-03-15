"use client";

export interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    locations: string[];
    causes: string[];
}

export interface UserData {
    profile: UserProfile;
    preferences: UserPreferences;
}

const STORAGE_KEY = "empact_user_data";

export const defaultUserData: UserData = {
    profile: {
        id: "user_1",
        name: "Elena Rostova",
        email: "elena.r@example.com",
        locations: ["Global", "Kenya"],
        causes: ["water_access", "healthcare"],
    },
    preferences: {
        emailNotifications: true,
        pushNotifications: false,
        twoFactorEnabled: false,
    },
};

export const userStore = {
    getUserData: (): UserData => {
        if (typeof window === "undefined") return defaultUserData;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return defaultUserData;
        return JSON.parse(stored);
    },

    saveUserData: (data: UserData) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    updateProfile: (profile: Partial<UserProfile>) => {
        const data = userStore.getUserData();
        const updated = { ...data, profile: { ...data.profile, ...profile } };
        userStore.saveUserData(updated);
        return updated;
    },

    updatePreferences: (preferences: Partial<UserPreferences>) => {
        const data = userStore.getUserData();
        const updated = { ...data, preferences: { ...data.preferences, ...preferences } };
        userStore.saveUserData(updated);
        return updated;
    },

    reset: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEY);
    }
};
