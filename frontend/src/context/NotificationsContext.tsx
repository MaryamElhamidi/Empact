"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
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

export type NotificationType = "CRITICAL_ALERT" | "IMPACT_UPDATE" | "PEER_ACTIVITY" | "GOAL_REACHED" | "GENERAL" | "SYSTEM_UPDATE";

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
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    timestamp: string;
    timeAgo: string;
    href: string;
}

interface NotificationsContextType {
    updates: Notification[];
    news: NewsItem[];
    unreadCount: number;
    isLoading: boolean;
    browserPushEnabled: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    addNotification: (notification: Omit<Notification, "id" | "isRead" | "timestamp" | "timeAgo" | "icon">) => void;
    refreshNotifications: () => void;
    requestPushPermission: () => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const typeToIcon: Record<string, LucideIcon> = {
    CRITICAL_ALERT: AlertTriangle,
    IMPACT_UPDATE: CheckCircle2,
    PEER_ACTIVITY: Users,
    GOAL_REACHED: Target,
    GENERAL: Bell,
    SYSTEM_UPDATE: Bell,
};

function formatTimeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (isNaN(diffMs)) return "Unknown time";
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [updates, setUpdates] = useState<Notification[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [browserPushEnabled, setBrowserPushEnabled] = useState(false);
    const lastSeenOppRef = useRef<string | null>(null);

    // Fetch persistent updates
    const fetchUpdates = useCallback(async () => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        if (!userId) return [];
        try {
            const rawList = await api.getNotifications(userId);
            return (rawList || []).map((raw: any) => ({
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
                actions: raw.actions,
            }));
        } catch (e) {
            console.error(e);
            return [];
        }
    }, [user?.profile?.id]);

    // Fetch dynamic news (opportunities)
    const fetchNews = useCallback(async () => {
        try {
            const opportunities = await api.getOpportunities();
            const latest = opportunities.slice(0, 5).map((opp: any) => ({
                id: opp.opportunity_id,
                title: opp.title,
                summary: opp.summary || "",
                timestamp: opp.date_discovered,
                timeAgo: formatTimeAgo(opp.date_discovered),
                href: `/discover#${opp.opportunity_id}`
            }));

            // Logic for browser push check
            if (opportunities.length > 0 && lastSeenOppRef.current && lastSeenOppRef.current !== opportunities[0].opportunity_id) {
                const newest = opportunities[0];
                if (browserPushEnabled) {
                    new Notification(newest.title, {
                        body: newest.summary?.slice(0, 100) + "...",
                        icon: "/globe.svg"
                    }).onclick = () => {
                        window.focus();
                        window.location.href = `/discover#${newest.opportunity_id}`;
                    };
                }
            }
            if (opportunities.length > 0) {
                lastSeenOppRef.current = opportunities[0].opportunity_id;
            }

            return latest;
        } catch (e) {
            console.error(e);
            return [];
        }
    }, [browserPushEnabled]);

    const refreshNotifications = useCallback(async () => {
        setIsLoading(true);
        const [upd, nws] = await Promise.all([fetchUpdates(), fetchNews()]);
        setUpdates(upd);
        setNews(nws);
        setIsLoading(false);
    }, [fetchUpdates, fetchNews]);

    useEffect(() => {
        refreshNotifications();

        // Setup polling for news
        const interval = setInterval(() => {
            fetchNews().then(items => setNews(items));
        }, 30000); // 30 seconds

        // Check browser permission initial state
        if (typeof window !== "undefined" && "Notification" in window) {
            setBrowserPushEnabled(Notification.permission === "granted");
        }

        return () => clearInterval(interval);
    }, [refreshNotifications, fetchNews]);

    const requestPushPermission = async () => {
        if (!("Notification" in window)) return false;
        const permission = await Notification.requestPermission();
        const granted = permission === "granted";
        setBrowserPushEnabled(granted);
        return granted;
    };

    const unreadCount = updates.filter(n => !n.isRead).length;

    const markAsRead = useCallback((id: string) => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        setUpdates(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        if (userId) api.markNotificationRead(userId, id).catch(() => { });
    }, [user?.profile?.id]);

    const markAllAsRead = useCallback(() => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        setUpdates(prev => prev.map(n => ({ ...n, isRead: true })));
        if (userId) api.markAllNotificationsRead(userId).catch(() => { });
    }, [user?.profile?.id]);

    const removeNotification = useCallback((id: string) => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        setUpdates(prev => prev.filter(n => n.id !== id));
        if (userId) api.deleteNotification(userId, id).catch(() => { });
    }, [user?.profile?.id]);

    const addNotification = useCallback((newNotif: Omit<Notification, "id" | "isRead" | "timestamp" | "timeAgo" | "icon">) => {
        const userId = user?.profile?.id ? Number(user.profile.id) : null;
        if (!userId) return;
        api.createNotification(userId, {
            type: newNotif.type,
            title: newNotif.title,
            message: newNotif.message,
            target: newNotif.target,
            actions: newNotif.actions,
        }).then(() => refreshNotifications()).catch(() => { });
    }, [user?.profile?.id, refreshNotifications]);

    return (
        <NotificationsContext.Provider value={{
            updates,
            news,
            unreadCount,
            isLoading,
            browserPushEnabled,
            markAsRead,
            markAllAsRead,
            removeNotification,
            addNotification,
            refreshNotifications,
            requestPushPermission
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
