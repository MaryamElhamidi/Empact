"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Loader2, Sparkles, Check, ChevronLeft, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const CAUSES = [
    { id: "children", label: "Children" },
    { id: "education", label: "Education" },
    { id: "healthcare", label: "Healthcare" },
    { id: "food_security", label: "Food Security" },
    { id: "refugees", label: "Refugees" },
    { id: "poverty", label: "Poverty" },
    { id: "climate", label: "Climate" },
    { id: "disaster_relief", label: "Disaster Relief" },
    { id: "conflict_relief", label: "Conflict Relief" },
    { id: "women_support", label: "Women Support" },
    { id: "water_access", label: "Water Access" },
    { id: "housing", label: "Housing" },
    { id: "medical_aid", label: "Medical Aid" },
];

const LOCATIONS = [
    "Global", "Africa", "Middle East", "South Asia", "Southeast Asia", "Latin America", "Eastern Europe", "Central Asia"
];

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const toggleCause = (id: string) => {
        setSelectedCauses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleLocation = (loc: string) => {
        setSelectedLocations(prev =>
            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(name, email, password, selectedLocations, selectedCauses);
            router.push("/account");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 px-4 py-12 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />

            <div className="w-full max-w-xl relative z-10">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg transition-transform hover:scale-105">
                            <span className="text-4xl font-bold leading-none mt-1 text-white">𖠋</span>
                        </div>
                        <span className="font-logo text-3xl font-bold tracking-tight text-foreground">EmPact</span>
                    </Link>
                </div>

                <Card className="rounded-[2.5rem] shadow-2xl border-border/40 shadow-black/5 overflow-hidden backdrop-blur-xl bg-card/95">
                    <CardHeader className="pt-10 pb-6 px-10 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-secondary/20">
                                <Sparkles size={14} /> Step {step} of 2
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold font-cabinet tracking-tight">
                            {step === 1 ? "Join the movement" : "Define your impact"}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium mt-2">
                            {step === 1
                                ? "Connect with real-world impact seamlessly"
                                : "Tell us which causes and locations matter most to you"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-10 pb-10">
                        {step === 1 ? (
                            <form onSubmit={handleNext} className="space-y-5">
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
                                >
                                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Causes Grid */}
                                <div className="space-y-4">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Heart size={14} className="text-secondary" /> Causes you care about
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {CAUSES.map(cause => (
                                            <button
                                                key={cause.id}
                                                onClick={() => toggleCause(cause.id)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between",
                                                    selectedCauses.includes(cause.id)
                                                        ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
                                                        : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50"
                                                )}
                                            >
                                                {cause.label}
                                                {selectedCauses.includes(cause.id) && <Check size={14} strokeWidth={3} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Locations Flex */}
                                <div className="space-y-4">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MapPin size={14} className="text-primary" /> Target Regions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {LOCATIONS.map(loc => (
                                            <button
                                                key={loc}
                                                onClick={() => toggleLocation(loc)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full border text-xs font-bold transition-all",
                                                    selectedLocations.includes(loc)
                                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
                                                        : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50"
                                                )}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-4">
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full h-14 rounded-[1.5rem] font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Create Your Impact Profile"
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(1)}
                                        className="font-bold text-muted-foreground hover:text-foreground gap-2"
                                        disabled={isLoading}
                                    >
                                        <ChevronLeft size={16} /> Back to info
                                    </Button>
                                </div>
                            </div>
                        )}

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
