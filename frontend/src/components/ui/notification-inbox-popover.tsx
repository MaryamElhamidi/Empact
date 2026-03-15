"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Newspaper, Activity, AlertCircle } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";

function NotificationInboxPopover() {
    const {
        updates,
        news,
        unreadCount,
        markAsRead,
        markAllAsRead,
        browserPushEnabled,
        requestPushPermission
    } = useNotifications();
    const [tab, setTab] = useState("news");

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="icon" variant="outline" className="relative group rounded-full w-10 h-10 border-border/40 hover:border-primary/50 transition-all duration-300" aria-label="Open notifications">
                    <Bell size={18} strokeWidth={2} aria-hidden="true" className="text-muted-foreground group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center bg-primary text-primary-foreground font-bold text-[10px] p-0 border-2 border-background shadow-sm shadow-primary/20">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 border-border/40 shadow-2xl shadow-black/10 rounded-2xl overflow-hidden" align="end">
                <Tabs value={tab} onValueChange={setTab}>
                    <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 bg-muted/20">
                        <TabsList className="bg-transparent gap-2 h-auto p-0 border-none">
                            <TabsTrigger value="news" className="text-xs font-bold h-8 px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
                                <Newspaper size={12} /> News
                            </TabsTrigger>
                            <TabsTrigger value="updates" className="text-xs font-bold h-8 px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
                                <Activity size={12} /> Updates
                                {unreadCount > 0 && <Badge size="sm" className="ml-0.5 bg-primary/10 text-primary border-none font-bold px-1.5 h-4 min-w-[16px]">{unreadCount}</Badge>}
                            </TabsTrigger>
                        </TabsList>
                        {tab === "updates" && unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors mr-2 uppercase tracking-tight"
                            >
                                Mark all
                            </button>
                        )}
                    </div>

                    {!browserPushEnabled && (
                        <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={14} className="text-primary" />
                                <p className="text-[11px] font-medium text-foreground/80 leading-tight">Enable browser alerts for urgent news</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => requestPushPermission()} className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10">
                                Enable
                            </Button>
                        </div>
                    )}

                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden divide-y divide-border/20">
                        {tab === "news" ? (
                            news.length === 0 ? (
                                <div className="px-6 py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                                    <div className="p-3 bg-muted rounded-full">
                                        <Newspaper size={24} className="opacity-20" />
                                    </div>
                                    <p className="font-medium">No recent news</p>
                                </div>
                            ) : (
                                news.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-all group relative border-none appearance-none"
                                    >
                                        <div className="mt-0.5 p-2 rounded-xl bg-primary/5 text-primary">
                                            <Newspaper size={16} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[13px] leading-snug tracking-tight font-bold text-foreground line-clamp-1">{item.title}</p>
                                            </div>
                                            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                                                {item.summary}
                                            </p>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pt-0.5">
                                                {item.timeAgo}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )
                        ) : updates.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                                <div className="p-3 bg-muted rounded-full">
                                    <Bell size={24} className="opacity-20" />
                                </div>
                                <p className="font-medium">No activity updates</p>
                            </div>
                        ) : (
                            updates.map((n) => {
                                const Icon = n.icon || Bell;
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-all group relative border-none"
                                    >
                                        <div className={cn(
                                            "mt-0.5 p-2 rounded-xl transition-all duration-300",
                                            !n.isRead ? "bg-secondary/10 text-secondary scale-110 shadow-sm" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn(
                                                    "text-[13px] leading-snug tracking-tight",
                                                    !n.isRead ? "font-bold text-foreground" : "text-foreground/70 font-medium"
                                                )}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />}
                                            </div>
                                            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 pt-0.5">
                                                {n.timeAgo}
                                                {n.target && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span className="text-secondary/70">{n.target}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </Tabs>

                <div className="p-2 border-t border-border/40 bg-muted/5">
                    <Link href="/notifications" className="block w-full">
                        <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary hover:text-primary/90 hover:bg-primary/5 h-10 rounded-xl">
                            View all notifications
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export { NotificationInboxPopover };
