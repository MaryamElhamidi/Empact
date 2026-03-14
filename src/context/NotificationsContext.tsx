"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    Bell,
    AlertTriangle,
    CheckCircle2,
    Users,
    Target,
    Heart,
    Eye,
    LucideIcon
} from "lucide-react";

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
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    addNotification: (notification: Omit<Notification, "id" | "isRead" | "timestamp" | "timeAgo">) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
    {
        id: "1",
        type: "CRITICAL_ALERT",
        title: "Urgent Relief Needed",
        message: "A major earthquake has struck Turkey. Immediate medical fuel is required for Al-Shifa hospital.",
        user: {
            name: "Emergency Response Team",
            avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emergency",
            fallback: "ER",
        },
        target: "Turkey Earthquake Fund",
        timestamp: "Today 3:12 PM",
        timeAgo: "12 mins ago",
        isRead: false,
        icon: AlertTriangle,
        actions: [
            { label: "Donate Now", href: "/donate", variant: "default" },
            { label: "Donate Later", variant: "outline" }
        ]
    },
    {
        id: "2",
        type: "IMPACT_UPDATE",
        title: "Your Impact in Kenya",
        message: "The community well you supported is now providing clean water to 400 people daily.",
        user: {
            name: "Water Project Kenya",
            fallback: "WP",
        },
        target: "Kenya Water Well #4",
        timestamp: "Today 2:00 PM",
        timeAgo: "2 hours ago",
        isRead: false,
        icon: CheckCircle2,
        actions: [
            { label: "View Impact Report", variant: "outline" }
        ]
    },
    {
        id: "3",
        type: "PEER_ACTIVITY",
        title: "New Follower",
        message: "Amélie is now following your impact journey.",
        user: {
            name: "Amélie",
            avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Amélie",
            fallback: "A",
        },
        timestamp: "Yesterday 4:30 PM",
        timeAgo: "1 day ago",
        isRead: true,
        icon: Users,
    },
    {
        id: "4",
        type: "GOAL_REACHED",
        title: "Goal Reached!",
        message: "The Gaza Relief Taskforce has reached its funding goal thanks to donors like you.",
        target: "Gaza Relief",
        timestamp: "2 days ago",
        timeAgo: "2 days ago",
        isRead: true,
        icon: Target,
    }
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addNotification = (newNotif: Omit<Notification, "id" | "isRead" | "timestamp" | "timeAgo">) => {
        const id = Math.random().toString(36).substr(2, 9);
        const now = new Date();
        setNotifications(prev => [
            {
                ...newNotif,
                id,
                isRead: false,
                timestamp: "Just now",
                timeAgo: "1 min ago",
            },
            ...prev
        ]);
    };

    return (
        <NotificationsContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            removeNotification,
            addNotification
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
