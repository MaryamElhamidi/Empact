"use client";

import { useAuth } from "@/context/AuthContext";
import { ImpactDashboard } from "@/components/account/ImpactDashboard";
import { WalletCard } from "@/components/account/WalletCard";
import { LogOut, User, Mail, ShieldAlert, Bell, Check, Loader2, Smartphone, ShieldCheck, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function Account() {
    const { user, logout, updateUser, isLoading } = useAuth();
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const { profile, preferences } = user;

    const history = [
        { id: 1, charity: "Global Medical Response", amount: 50, date: "Oct 24, 2026", receipt: "#" },
        { id: 2, charity: "Climate Action Network", amount: 25, date: "Sep 12, 2026", receipt: "#" },
        { id: 3, charity: "Disaster Relief Asia", amount: 100, date: "Jul 05, 2026", receipt: "#" },
    ];

    const togglePreference = async (key: keyof typeof preferences) => {
        setIsUpdating(true);
        const updatedUser = {
            ...user,
            preferences: {
                ...preferences,
                [key]: !preferences[key]
            }
        };
        updateUser(updatedUser);
        setIsUpdating(false);
    };

    const handleSignOut = () => {
        logout();
        router.push("/");
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-muted/20 pb-24">
            <div className="bg-primary text-primary-foreground pt-16 pb-28 md:pb-36 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent opacity-90" />
                <div className="absolute right-0 top-0 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-2xl backdrop-blur-md relative group">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-[2.5rem]" />
                        ) : (
                            <User className="w-16 h-16 md:w-20 md:h-20 opacity-80" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] cursor-pointer">
                            <p className="text-[10px] font-bold uppercase tracking-wider">Change</p>
                        </div>
                    </div>
                    <div className="md:mt-4">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tight">{profile.name}</h1>
                            {preferences.twoFactorEnabled && (
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-none font-bold uppercase text-[10px] px-3 py-1 flex items-center gap-1.5 h-fit mt-1">
                                    <ShieldCheck size={12} /> Verified
                                </Badge>
                            )}
                        </div>
                        <p className="text-primary-foreground/90 font-bold text-lg flex items-center justify-center md:justify-start gap-3 bg-secondary/50 px-5 py-2.5 rounded-2xl w-fit mx-auto md:mx-0 border border-white/10 shadow-lg shadow-black/5">
                            <Mail className="w-4 h-4" /> {profile.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-16 relative z-20">
                <div className="bg-card rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-border/40 shadow-black/5 backdrop-blur-xl bg-card/80">
                    <ImpactDashboard />
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-8 flex flex-col gap-12">
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black font-cabinet tracking-tight">Donation History</h3>
                            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 hover:text-primary rounded-xl">View All</Button>
                        </div>
                        <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 overflow-hidden">
                            {history.map((record, i) => (
                                <div key={record.id} className={`p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-muted/30 transition-colors ${i !== history.length - 1 ? 'border-b border-border/20' : ''}`}>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1 text-foreground">{record.charity}</h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{record.date}</p>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Check size={12} strokeWidth={3} /> Completed
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                                        <span className="text-3xl font-black font-cabinet">${record.amount}</span>
                                        <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-bold px-6 h-12 shadow-sm transition-all">
                                            Receipt
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black font-cabinet tracking-tight">Your Interests</h3>
                            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 hover:text-primary rounded-xl">Edit Interests</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 p-8 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                                        <Heart size={20} fill="currentColor" />
                                    </div>
                                    <h4 className="font-bold text-xl">Causes</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.causes.length > 0 ? (
                                        profile.causes.map(cause => (
                                            <Badge key={cause} variant="secondary" className="bg-secondary/10 text-secondary border-none font-bold uppercase text-[10px] px-3 py-1.5 h-auto rounded-lg">
                                                {cause.replace('_', ' ')}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground font-medium">No causes selected.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 p-8 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                        <MapPin size={20} />
                                    </div>
                                    <h4 className="font-bold text-xl">Regions</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.locations.length > 0 ? (
                                        profile.locations.map(loc => (
                                            <Badge key={loc} variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase text-[10px] px-3 py-1.5 h-auto rounded-lg">
                                                {loc}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground font-medium">No regions selected.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-3xl font-black font-cabinet tracking-tight mb-8">Account Security</h3>
                        <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 p-8 md:p-10 flex flex-col gap-10">
                            {/* Email Notifications */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/5 rounded-2xl text-primary shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1 mt-0.5">Email Alerts</h4>
                                        <p className="text-sm text-muted-foreground font-medium max-w-sm">Receive impact reports and urgent crisis alerts directly in your inbox.</p>
                                    </div>
                                </div>
                                <Button
                                    variant={preferences.emailNotifications ? "default" : "outline"}
                                    onClick={() => togglePreference("emailNotifications")}
                                    className={`rounded-xl font-bold px-8 h-12 min-w-[120px] transition-all ${preferences.emailNotifications ? 'bg-primary' : 'border-border/60'}`}
                                >
                                    {preferences.emailNotifications ? "Enabled" : "Enable"}
                                </Button>
                            </div>

                            {/* Push Notifications */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-border/20 pt-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/5 rounded-2xl text-secondary shrink-0">
                                        <Smartphone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1 mt-0.5">Push Notifications</h4>
                                        <p className="text-sm text-muted-foreground font-medium max-w-sm">Get real-time updates on your device when impact goals are reached.</p>
                                    </div>
                                </div>
                                <Button
                                    variant={preferences.pushNotifications ? "default" : "outline"}
                                    onClick={() => togglePreference("pushNotifications")}
                                    className={`rounded-xl font-bold px-8 h-12 min-w-[120px] transition-all ${preferences.pushNotifications ? 'bg-secondary' : 'border-border/60'}`}
                                >
                                    {preferences.pushNotifications ? "Enabled" : "Enable"}
                                </Button>
                            </div>

                            {/* 2FA */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-border/20 pt-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1 mt-0.5">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground font-medium max-w-sm flex items-center gap-1.5">
                                            {preferences.twoFactorEnabled ? (
                                                <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                                                    <ShieldCheck className="w-4 h-4" /> Secure access enabled
                                                </span>
                                            ) : (
                                                "Protect your account with an extra layer of security."
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant={preferences.twoFactorEnabled ? "destructive" : "outline"}
                                    onClick={() => togglePreference("twoFactorEnabled")}
                                    className={`rounded-xl font-bold px-8 h-12 min-w-[120px] transition-all ${preferences.twoFactorEnabled ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20' : 'border-border/60'}`}
                                >
                                    {preferences.twoFactorEnabled ? "Disable" : "Enable"}
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <WalletCard />

                    <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg">System Status</h4>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Online</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Session Expires</span>
                                <span>23m 45s</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium pb-2 border-b border-border/20">
                                <span className="text-muted-foreground">Last Login</span>
                                <span>Today, 9:24 AM</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleSignOut}
                            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-16 rounded-[1.5rem] font-black text-lg border border-transparent hover:border-destructive/20 transition-all gap-3"
                        >
                            <LogOut className="w-6 h-6" /> Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
