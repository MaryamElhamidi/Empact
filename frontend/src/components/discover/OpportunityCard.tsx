"use client";

import { MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface OpportunityProps {
    id: string;
    title: string;
    region: string;
    summary: string;
    donationUrl: string | null;
    organizationWebsite: string | null;
    isVerified?: boolean;
}

interface OpportunityCardProps {
    data: OpportunityProps;
    onSupportClick?: (opportunityId: string) => void;
    highlighted?: boolean;
}

export function OpportunityCard({ data, onSupportClick, highlighted }: OpportunityCardProps) {
    const orgLink = data.donationUrl || data.organizationWebsite || null;

    const handleSupport = () => {
        if (orgLink) {
            window.open(orgLink, "_blank", "noopener,noreferrer");
        }
        onSupportClick?.(data.id);
    };

    return (
        <Card
            id={`opp-${data.id}`}
            className={cn(
                "group overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl flex flex-col h-full",
                highlighted && "ring-2 ring-primary ring-offset-4 ring-offset-background scale-[1.02] shadow-2xl shadow-primary/20 z-10"
            )}
        >
            <div className="relative h-40 w-full overflow-hidden bg-muted flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-background" />
                <div className="absolute top-4 left-4 flex gap-2">
                    {data.isVerified && (
                        <div className="bg-white/95 backdrop-blur-md text-primary px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> VERIFIED
                        </div>
                    )}
                </div>
            </div>
            <CardHeader className="p-5 pb-2">
                <div className="flex gap-1.5 items-center text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    <MapPin className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                    <span className="line-clamp-1">{data.region}</span>
                </div>
                <h3 className="font-sans font-bold text-xl leading-tight line-clamp-2 text-foreground">{data.title}</h3>
            </CardHeader>
            <CardContent className="p-5 pt-1 flex-grow">
                <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">{data.summary}</p>
            </CardContent>
            <CardFooter className="p-5 pt-0">
                <Button
                    className="w-full h-11 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm"
                    onClick={handleSupport}
                >
                    Support Initiative
                </Button>
            </CardFooter>
        </Card>
    );
}
