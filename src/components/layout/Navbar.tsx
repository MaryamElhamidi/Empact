"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, Globe2, LayoutDashboard, Search, HeartPulse } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { name: "Home", path: "/", icon: <Globe2 className="w-4 h-4" /> },
        { name: "Discover", path: "/discover", icon: <Search className="w-4 h-4" /> },
        { name: "Account", path: "/account", icon: <LayoutDashboard className="w-4 h-4" /> },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl">
            <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                        <span className="font-logo text-3xl font-bold leading-none mt-1">𖦏</span>
                    </div>
                    <span className="font-logo text-2xl font-bold tracking-wide mt-1">EmPact</span>
                </Link>

                <div className="hidden md:flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl border border-border/40">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                                    isActive
                                        ? "bg-white text-primary shadow-sm border border-border/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                )}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/notifications" className="relative p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group">
                        <Bell className="w-5 h-5 group-hover:animate-pulse" />
                        <span className="absolute top-2.5 right-2 w-2.5 h-2.5 bg-secondary rounded-full border-[2px] border-background" />
                    </Link>
                    <Link href="/donate" className="flex items-center justify-center h-11 px-5 sm:px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all gap-2">
                        <HeartPulse className="w-4 h-4" /> <span className="hidden sm:inline">Donate Now</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
