"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "@/components/discover/FilterBar";
import { OpportunityCard, OpportunityProps } from "@/components/discover/OpportunityCard";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Discover() {
    const [opportunities, setOpportunities] = useState<OpportunityProps[]>([]);
    const [topIssues, setTopIssues] = useState<Array<{ name: string; icon: string; count: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [issuesLoading, setIssuesLoading] = useState(true);

    useEffect(() => {
        api.getOpportunities()
            .then((rows: Array<{ id: number; title: string; country: string; summary: string; urgency: string; imageUrl: string | null; isVerified: boolean; recommendation: string | null }>) => {
                setOpportunities(
                    rows.map((opp) => ({
                        id: String(opp.id),
                        title: opp.title,
                        country: opp.country,
                        summary: opp.summary || "",
                        urgency: (opp.urgency || "MODERATE") as OpportunityProps["urgency"],
                        imageUrl: opp.imageUrl || "",
                        isVerified: opp.isVerified,
                        recommendation: opp.recommendation ?? undefined,
                    }))
                );
            })
            .catch(() => setOpportunities([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        api.getGlobalIssues()
            .then(setTopIssues)
            .catch(() => setTopIssues([]))
            .finally(() => setIssuesLoading(false));
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            <div className="bg-primary text-primary-foreground pt-20 pb-28 lg:pb-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary opacity-50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526976663112-0059bf0cf736?q=80&w=2670&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="container mx-auto px-4 relative z-10 lg:pl-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-6 tracking-tight">Discover Impact</h1>
                    <p className="text-lg md:text-xl text-primary-foreground max-w-2xl leading-relaxed font-medium">Find verified humanitarian opportunities curated by AI based on urgency and your past support.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-12 relative z-20">
                <FilterBar />
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold font-sans">Top Global Issues</h2>
                </div>
                {issuesLoading ? (
                    <div className="flex gap-4 overflow-x-auto pb-8 items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x">
                        {topIssues.length === 0 ? (
                            <p className="text-muted-foreground font-medium py-8">No issues loaded. Run the seed script to add global issues.</p>
                        ) : (
                            topIssues.map((issue) => (
                                <div key={issue.name} className="flex-shrink-0 w-72 p-8 rounded-3xl border border-border bg-card shadow-sm snap-start hover:-translate-y-2 transition-transform cursor-pointer group">
                                    <div className="text-5xl mb-6 transition-transform group-hover:scale-110 origin-left">{issue.icon || "📌"}</div>
                                    <h3 className="font-bold text-xl mb-2">{issue.name}</h3>
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">{issue.count} Opportunities</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-20">
                <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-6">
                    <h2 className="text-3xl md:text-4xl font-bold font-sans">Live Crisis Feed</h2>
                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-primary/20">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(225,28,35,0.6)]" /> Live Updates
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : opportunities.length === 0 ? (
                    <p className="text-muted-foreground font-medium py-12">No opportunities yet. Run the seed script to add opportunities.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                        {opportunities.map((opp) => (
                            <OpportunityCard key={opp.id} data={opp} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
