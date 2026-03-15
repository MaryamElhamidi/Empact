"use client";

import { MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Format cause/value for display (e.g. disaster_relief → Disaster relief) */
function formatTag(s: string): string {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function normCause(s: string): string {
    return (s || "").toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

export interface OpportunityProps {
    id: string;
    title: string;
    region: string;
    summary: string;
    donationUrl: string | null;
    organizationWebsite: string | null;
    isVerified?: boolean;
    cause?: string | null;
    values?: string[];
}

interface OpportunityCardProps {
    data: OpportunityProps;
    onSupportClick?: (opportunityId: string) => void;
}

export function OpportunityCard({ data, onSupportClick }: OpportunityCardProps) {
    const orgLink = data.donationUrl || data.organizationWebsite || null;
    const causeFormatted = data.cause ? formatTag(data.cause) : null;
    const causeNorm = normCause(data.cause || "");
    const valuesFormatted = (data.values || [])
        .filter((v) => v && normCause(v) !== causeNorm)
        .map(formatTag);
    const seen = new Set<string>();
    const tags = [
        ...(causeFormatted ? [causeFormatted] : []),
        ...valuesFormatted.filter((t) => {
            if (seen.has(t) || t === causeFormatted) return false;
            seen.add(t);
            return true;
        }),
    ];

    const handleSupport = () => {
        if (orgLink) {
            window.open(orgLink, "_blank", "noopener,noreferrer");
        }
        onSupportClick?.(data.id);
    };

    return (
        <Card className="group overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl flex flex-col h-full">
            <CardHeader className="p-5 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    {data.isVerified && (
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border border-primary/20">
                            <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
                        </span>
                    )}
                    {tags.map((t) => (
                        <span key={t} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-[11px] font-medium">
                            {t}
                        </span>
                    ))}
                </div>
                <div className="flex gap-1.5 items-center text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
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
