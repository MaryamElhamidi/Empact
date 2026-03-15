"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DonationButtonGroup } from "@/components/donate/DonationButtonGroup";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CheckCircle2, ShieldCheck, ArrowRight, HeartPulse } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

export default function DonateFlow() {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const handleDonate = async () => {
        if (amount <= 0) return;
        if (!user?.profile?.id) {
            router.push("/login");
            return;
        }
        setError(null);
        setStep(2);
        try {
            await api.createDonation({
                user_id: Number(user.profile.id),
                amount,
                currency: "USD",
                campaign_url: undefined,
            });
            await api.createNotification(Number(user.profile.id), {
                type: "IMPACT_UPDATE",
                title: "Impact Confirmed!",
                message: `Your $${amount} donation provided emergency support for ${Math.floor(amount / 6.25) || 1} families. Thank you!`,
                target: "Donation History"
            });
            setStep(3);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Donation failed");
            setStep(1);
        }
    };

    const getImpactEstimate = () => {
        if (amount === 0) return "Select an amount to see your specific impact.";
        const families = Math.floor(amount / 6.25);
        return `Provides emergency support for ${families || 1} famil${families === 1 ? 'y' : 'ies'}.`;
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
                <HeartPulse className="w-10 h-10 animate-pulse text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-muted/20 items-center justify-center gap-6 px-4">
                <p className="text-lg font-medium text-muted-foreground">Sign in to make a donation.</p>
                <Link href="/login">
                    <Button className="rounded-2xl font-bold">Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-muted/20">
            <div className="container mx-auto px-4 py-12 md:py-20 flex-grow flex items-center justify-center">
                <div className="w-full max-w-2xl bg-card border border-border/60 rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col gap-8"
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 text-primary mb-6 shadow-sm border border-primary/10">
                                        <HeartPulse className="w-10 h-10" />
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-sans font-bold mb-4 tracking-tight">Make an Impact</h1>
                                    <p className="text-muted-foreground text-lg md:text-xl font-medium">Your support directly helps frontline humanitarian efforts immediately.</p>
                                </div>

                                <div className="bg-muted/40 rounded-3xl p-6 md:p-8 border border-border/60">
                                    <h3 className="font-bold text-xl mb-5 uppercase tracking-wider text-muted-foreground text-sm">1. Choose your donation</h3>
                                    <DonationButtonGroup onAmountSelect={setAmount} />
                                </div>

                                <div className="bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10 flex flex-col md:flex-row items-start md:items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-border/50 shrink-0">
                                        <ShieldCheck className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary mb-1 uppercase tracking-wider text-sm">2. Impact Estimate</h4>
                                        <p className="text-foreground/80 font-semibold text-lg">{getImpactEstimate()}</p>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-destructive font-medium text-sm">{error}</p>
                                )}

                                <Button
                                    onClick={handleDonate}
                                    disabled={amount === 0}
                                    className="w-full h-16 md:h-20 text-xl font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl hover:-translate-y-1 hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none mt-4"
                                >
                                    <HeartPulse className="w-6 h-6 mr-3" /> Donate ${amount > 0 ? amount : "..."}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground font-semibold">100% secure payment. Cancel auto-donations anytime.</p>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 gap-8"
                            >
                                <div className="relative">
                                    <div className="w-32 h-32 border-[6px] border-muted rounded-full" />
                                    <div className="absolute top-0 left-0 w-32 h-32 border-[6px] border-primary rounded-full border-t-transparent animate-spin ring-secondary ring-offset-2" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold font-sans mb-3">Processing...</h2>
                                    <p className="text-muted-foreground font-medium text-lg">Securely confirming your impact.</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="flex flex-col items-center text-center py-12"
                            >
                                <div className="w-32 h-32 rounded-[2rem] bg-accent/10 flex items-center justify-center text-accent mb-10 relative border-2 border-accent/20">
                                    <div className="absolute inset-0 bg-accent rounded-[2rem] animate-ping opacity-20" />
                                    <CheckCircle2 className="w-16 h-16 relative z-10" />
                                </div>

                                <h2 className="text-5xl md:text-6xl font-bold font-sans mb-6 text-foreground tracking-tight">Impact Confirmed</h2>
                                <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-3xl p-8 mb-12 w-full max-w-lg shadow-inner">
                                    <p className="text-xl text-primary font-medium leading-relaxed">
                                        Your <span className="font-bold text-2xl">${amount}</span> donation provided emergency support for <span className="font-bold text-2xl underline decoration-secondary decoration-4 underline-offset-4">{Math.floor(amount / 6.25) || 1} families</span>.
                                    </p>
                                </div>

                                <Link href="/account" className="w-full">
                                    <InteractiveHoverButton className="w-full justify-center h-20 text-xl shadow-xl shadow-primary/10 rounded-2xl">
                                        View Impact Dashboard
                                    </InteractiveHoverButton>
                                </Link>
                                <Link href="/" className="mt-8 text-muted-foreground font-bold hover:text-primary transition-colors flex items-center gap-2 text-lg">
                                    Return to Home <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
