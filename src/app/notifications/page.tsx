"use client";

import { NotificationsMenu } from "@/components/ui/notifications-menu";

export default function Notifications() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-muted/10 items-center justify-start pt-12 md:pt-24 px-4 pb-20">
            <div className="w-full max-w-[520px] bg-white rounded-3xl shadow-2xl shadow-black/5 overflow-hidden border border-border/40">
                <NotificationsMenu />
            </div>
        </div>
    );
}
