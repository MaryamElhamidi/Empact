"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Settings, BellOff, ExternalLink, HeartPulse, Clock } from "lucide-react";
import { useNotifications, Notification } from "@/context/NotificationsContext";

function NotificationItem({ notification }: { notification: Notification }) {
    const { markAsRead } = useNotifications();

    return (
        <div
            className={`w-full py-6 first:pt-0 last:pb-0 transition-opacity ${notification.isRead ? "opacity-75" : "opacity-100"}`}
            onClick={() => markAsRead(notification.id)}
        >
            <div className="flex gap-4">
                <div className="relative isolate">
                    <Avatar className="size-12 ring-2 ring-border shadow-sm">
                        <AvatarImage
                            src={notification.user?.avatar || ""}
                            alt={`${notification.user?.name || "System"}'s profile picture`}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                            {notification.user?.fallback || "SY"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md z-10">
                        <notification.icon size={14} className="text-primary" />
                    </div>
                </div>

                <div className="flex flex-1 flex-col space-y-3">
                    <div className="w-full">
                        <div className="flex items-start justify-between gap-2">
                            <div className="text-[15px] leading-tight">
                                <span className="font-bold text-foreground">
                                    {notification.user?.name || "System"}
                                </span>
                                <span className="text-muted-foreground">
                                    {" — "}
                                    {notification.title}
                                </span>
                            </div>
                            {!notification.isRead && (
                                <div className="size-2 rounded-full bg-primary mt-1 shadow-sm shadow-primary/40"></div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-bold text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={10} />
                                {notification.timeAgo}
                            </span>
                            <span className="size-1 rounded-full bg-border" />
                            <span className="text-[11px] text-muted-foreground font-medium">
                                {notification.timestamp}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-muted/30 border border-border/20 p-4 text-[14px] leading-relaxed text-foreground/80 font-medium">
                        {notification.message}
                    </div>

                    {notification.actions && notification.actions.length > 0 && (
                        <div className="flex gap-3 pt-1">
                            {notification.actions.map((action, idx) => {
                                const isDonateNow = action.label === "Donate Now";
                                const isDonateLater = action.label === "Donate Later";

                                return (
                                    <Button
                                        key={idx}
                                        variant={action.variant || "default"}
                                        size="sm"
                                        className={`h-9 px-5 text-xs font-bold rounded-xl transition-all ${isDonateNow ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" :
                                                isDonateLater ? "hover:bg-primary/5 hover:text-primary hover:border-primary/30" : ""
                                            }`}
                                        asChild={!!action.href}
                                    >
                                        {action.href ? (
                                            <Link href={action.href} className="flex items-center gap-2">
                                                {isDonateNow && <HeartPulse size={14} />}
                                                {action.label}
                                                {!isDonateNow && <ExternalLink size={14} />}
                                            </Link>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                {isDonateLater && <Clock size={14} />}
                                                {action.label}
                                            </span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const NotificationsMenu = () => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const [activeTab, setActiveTab] = React.useState<string>("all");

    const criticalCount = notifications.filter(n => n.type === "CRITICAL_ALERT").length;
    const impactCount = notifications.filter(n => n.type === "IMPACT_UPDATE").length;

    const getFilteredNotifications = () => {
        switch (activeTab) {
            case "critical":
                return notifications.filter(n => n.type === "CRITICAL_ALERT");
            case "impact":
                return notifications.filter(n => n.type === "IMPACT_UPDATE");
            default:
                return notifications;
        }
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <Card className="flex w-full flex-col gap-8 p-6 shadow-none border-none bg-transparent relative overflow-hidden">
            <CardHeader className="p-0 space-y-8">
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-3xl font-black font-cabinet tracking-tight text-foreground">
                            Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-70">
                            Your Humanitarian Pulse
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            className="size-10 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all border border-border/40"
                            variant="ghost"
                            size="icon"
                            title="Mark all as read"
                            onClick={markAllAsRead}
                        >
                            <Check className="size-5" />
                        </Button>
                        <Button
                            className="size-10 rounded-2xl hover:bg-muted transition-all border border-border/40"
                            variant="ghost"
                            size="icon"
                            title="Notification Settings"
                        >
                            <Settings className="size-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full relative z-10"
                >
                    <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto border border-border/40 flex w-fit">
                        <TabsTrigger value="all" className="rounded-xl py-2.5 px-5 gap-2.5 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/5">
                            All
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[11px] px-2 h-5 font-bold">{notifications.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="critical" className="rounded-xl py-2.5 px-5 gap-2.5 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/5">
                            Urgent
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-none text-[11px] px-2 h-5 font-bold">{criticalCount}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="impact" className="rounded-xl py-2.5 px-5 gap-2.5 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/5">
                            Impact
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[11px] px-2 h-5 font-bold">{impactCount}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent className="h-full p-0 relative z-10">
                <div className="space-y-0 divide-y divide-border/20">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-6 py-24 text-center animate-in fade-in zoom-in duration-500">
                            <div className="rounded-full bg-primary/5 p-8 border border-primary/10 shadow-inner">
                                <BellOff className="size-10 text-primary/30" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-foreground">
                                    No notifications in this category
                                </p>
                                <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xs mx-auto">
                                    You're all caught up! Check back later for new humanitarian updates.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
