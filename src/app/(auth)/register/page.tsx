"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(name, email, password);
            router.push("/account");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 px-4 py-20 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />

            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                            <span className="text-4xl font-bold leading-none mt-1">𖠋</span>
                        </div>
                        <span className="font-logo text-3xl font-bold tracking-tight">EmPact</span>
                    </Link>
                </div>

                <Card className="rounded-[2.5rem] shadow-2xl border-border/40 shadow-black/5 overflow-hidden">
                    <CardHeader className="pt-10 pb-6 px-10 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-secondary/20">
                                <Sparkles size={14} /> New Journey
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold font-cabinet tracking-tight">Join the movement</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium mt-2">
                            Connect with real-world impact seamlessly
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Elena Rostova"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-14 rounded-2xl border-border/40 focus:ring-primary/20 bg-muted/10 px-6 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 rounded-2xl border-border/40 focus:ring-primary/20 bg-muted/10 px-6 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 rounded-2xl border-border/40 focus:ring-primary/20 bg-muted/10 px-6 font-medium"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-[1.5rem] font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Create Account <ArrowRight className="ml-2 w-5 h-5" /></>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-xs text-muted-foreground leading-relaxed px-4 font-medium">
                            By joining, you agree to our <Link href="#" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
                        </div>

                        <div className="mt-8 text-center pt-6 border-t border-border/40">
                            <p className="text-sm text-muted-foreground font-medium">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-bold hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
