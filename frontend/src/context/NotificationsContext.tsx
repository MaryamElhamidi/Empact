"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Users,
    Target,
    Bell,
    LucideIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export type NotificationType = "CRITICAL_ALERT" | "IMPACT_UPDATE" | "PEER_ACTIVITY" | "GOAL_REACHED" | "GENERAL";

export interface NotificationAction {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive";
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    user?: {
        name: string;
        avatar?: string;
        fallback: string;
    };
    target?: string;
    timestamp: string;
    timeAgo: string;
    isRead: boolean;
    icon: LucideIcon;
    actions?: NotificationAction[];
    content?: string;
    file?: {
        name: string;
        size: string;
        type: string;
    };
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    addNotification: (notification: Omit<Notification, "id" | "isRead" | "timestamp" | "timeAgo">) => void;
    refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const typeToIcon: Record<string, LucideIcon> = {
    CRITICAL_ALERT: AlertTriangle,
    IMPACT_UPDATE: CheckCircle2,
    PEER_ACTIVITY: Users,
    GOAL_REACHED: Target,
    GENERAL: Bell,
};

function formatTimeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return d.toLocaleDateString();
}

function mapBackendToNotification(raw: {
    id: number;
    type: string;
    title: string;
    message: string;
    target?: string;
    userName?: string;
    userAvatar?: string;
    userFallback?: string;
    isRead: boolean;
    actions?: unknown;
    createdAt: string;
}): Notification {
    return {
        id: String(raw.id),
        type: (raw.type || "GENERAL") as NotificationType,
        title: raw.title,
        message: raw.message,
        target: raw.target,
        user: raw.userName ? { name: raw.userName, avatar: raw.userAvatar, fallback: raw.userFallback || raw.userName.slice(0, 2).toUpperCase() } : undefined,
        timestamp: new Date(raw.createdAt).toLocaleString(),
        timeAgo: formatTimeAgo(raw.createdAt),
        isRead: !!raw.isRead,
        icon: typeToIcon[raw.type] || Bell,
        actions: Array.isArray(raw.actions) ? (raw.actions as NotificationAction[]) : undefined,
    };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshNotifications = useCallback(() => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        if (!userId) {
            setNotifications([]);
            return;
        }
        setIsLoading(true);
        api.getNotifications(userId)
            .then((rawList: unknown[]) => {
                setNotifications((rawList || []).map((r) => mapBackendToNotification(r as Parameters<typeof mapBackendToNotification>[0])));
            })
            .catch(() => setNotifications([]))
            .finally(() => setIsLoading(false));
    }, [user?.profile?.id]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = useCallback((id: string) => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        if (userId) api.markNotificationRead(userId, id).catch(() => {});
    }, [user?.profile?.id]);

    const markAllAsRead = useCallback(() => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        if (userId) api.markAllNotificationsRead(userId).catch(() => {});
    }, [user?.profile?.id]);

    const removeNotification = useCallback((id: string) => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (userId) api.deleteNotification(userId, id).catch(() => {});
    }, [user?.profile?.id]);

    const addNotification = useCallback((newNotif: Omit<Notification, "id" | "isRead" | "timestamp" | "timeAgo">) => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        if (!userId) return;
        api.createNotification(userId, {
            type: newNotif.type,
            title: newNotif.title,
            message: newNotif.message,
            target: newNotif.target,
            user: newNotif.user,
            actions: newNotif.actions,
        }).then(() => refreshNotifications()).catch(() => {});
    }, [user?.profile?.id, refreshNotifications]);

    return (
        <NotificationsContext.Provider value={{
            notifications,
            unreadCount,
            isLoading,
            markAsRead,
            markAllAsRead,
            removeNotification,
            addNotification,
            refreshNotifications,
        }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return context;
}
