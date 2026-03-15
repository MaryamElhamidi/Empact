"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Activity, Check, Settings, BellOff, ExternalLink, HeartPulse, Clock } from "lucide-react";
import { useNotifications, Notification, NewsItem as NewsItemType } from "@/context/NotificationsContext";

function NewsItem({ item }: { item: NewsItemType }) {
    return (
        <Link
            href={item.href}
            className="flex w-full items-start gap-4 py-6 first:pt-0 last:pb-0 hover:bg-muted/5 transition-colors group relative border-none appearance-none"
        >
            <div className="size-12 rounded-[1.25rem] bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                <Newspaper size={20} />
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[17px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                </div>
                <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                    {item.summary}
                </p>
                <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} />
                        {item.timeAgo}
                    </span>
                    <span className="size-1 rounded-full bg-border" />
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Global Crisis Feed</span>
                </div>
            </div>
        </Link>
    );
}

function NotificationItem({ notification }: { notification: Notification }) {
    const { markAsRead } = useNotifications();

    return (
        <div
            className={`w-full py-6 first:pt-0 last:pb-0 transition-opacity cursor-pointer ${notification.isRead ? "opacity-75" : "opacity-100"}`}
            onClick={() => markAsRead(notification.id)}
        >
            <div className="flex gap-4">
                <div className="relative isolate shrink-0">
                    <Avatar className="size-12 rounded-[1.25rem] ring-2 ring-border shadow-sm">
                        <AvatarImage
                            src={notification.user?.avatar || ""}
                            alt={`${notification.user?.name || "System"}'s profile picture`}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">
                            {notification.user?.fallback || "SY"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-md z-10 border border-border/40">
                        <notification.icon size={12} className="text-secondary" />
                    </div>
                </div>

                <div className="flex flex-1 flex-col space-y-3">
                    <div className="w-full">
                        <div className="flex items-start justify-between gap-2">
                            <div className="text-[16px] leading-snug">
                                <span className="font-bold text-foreground">
                                    {notification.user?.name || "EmPact System"}
                                </span>
                                <span className="text-muted-foreground font-medium">
                                    {" — "}
                                    {notification.title}
                                </span>
                            </div>
                            {!notification.isRead && (
                                <div className="size-2.5 rounded-full bg-secondary mt-1 shadow-sm shadow-secondary/40 animate-pulse"></div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-bold text-secondary/70 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={10} />
                                {notification.timeAgo}
                            </span>
                            <span className="size-1 rounded-full bg-border" />
                            <span className="text-[11px] text-muted-foreground font-medium">
                                {notification.timestamp}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-muted/40 border border-border/20 p-4 text-[14px] leading-relaxed text-foreground/80 font-medium">
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
    const { updates, news, unreadCount, markAllAsRead, isLoading } = useNotifications();
    const [activeTab, setActiveTab] = React.useState<string>("news");

    return (
        <Card className="flex w-full flex-col gap-8 p-6 md:p-10 shadow-none border-none bg-transparent relative overflow-hidden">
            <CardHeader className="p-0 space-y-8">
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-4xl font-black font-cabinet tracking-tight text-foreground">
                            Inbox
                        </h3>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1.5 opacity-70">
                            {activeTab === "news" ? "Global Humanitarian Pulse" : "Your Impact Activity"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeTab === "updates" && unreadCount > 0 && (
                            <Button
                                className="h-10 px-4 rounded-xl hover:bg-secondary/10 hover:text-secondary text-xs font-bold transition-all border border-secondary/20"
                                variant="ghost"
                                onClick={markAllAsRead}
                            >
                                <Check size={14} className="mr-2" /> Mark all read
                            </Button>
                        )}
                        <Button
                            className="size-10 rounded-xl hover:bg-muted transition-all border border-border/40"
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
                    <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto border border-border/40 flex w-fit gap-2">
                        <TabsTrigger value="news" className="rounded-xl py-3 px-6 gap-3 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/5 flex items-center">
                            <Newspaper size={16} />
                            News
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[11px] px-2 h-5 font-bold">{news.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="updates" className="rounded-xl py-3 px-6 gap-3 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/5 flex items-center">
                            <Activity size={16} />
                            Updates
                            {unreadCount > 0 && <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[11px] px-2 h-5 font-bold">{unreadCount}</Badge>}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent className="h-full p-0 relative z-10">
                <div className="space-y-0 divide-y divide-border/20">
                    {isLoading ? (
                        <div className="py-32 flex items-center justify-center text-muted-foreground font-medium">
                            <div className="flex flex-col items-center gap-4">
                                <Clock className="size-8 animate-pulse opacity-20" />
                                <span>Loading feed…</span>
                            </div>
                        </div>
                    ) : activeTab === "news" ? (
                        news.length > 0 ? (
                            news.map((item) => (
                                <NewsItem key={item.id} item={item} />
                            ))
                        ) : (
                            <EmptyState icon={Newspaper} title="No recent news" description="Stay tuned for global humanitarian updates." />
                        )
                    ) : updates.length > 0 ? (
                        updates.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    ) : (
                        <EmptyState icon={BellOff} title="No activity updates" description="Your impact journey starts here. Start supporting initiatives to see updates." />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="size-24 rounded-[2rem] bg-muted/30 flex items-center justify-center border border-border/20 shadow-inner">
                <Icon className="size-10 text-muted-foreground/30" />
            </div>
            <div>
                <p className="text-2xl font-black font-cabinet text-foreground uppercase tracking-tight">
                    {title}
                </p>
                <p className="text-sm text-muted-foreground font-medium mt-2 max-w-[240px] mx-auto leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}
