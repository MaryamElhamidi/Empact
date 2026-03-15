"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FilterBar } from "@/components/discover/FilterBar";
import { OpportunityCard, OpportunityProps } from "@/components/discover/OpportunityCard";
import { SupportInitiativeModal } from "@/components/discover/SupportInitiativeModal";
import { api } from "@/lib/api";
import { useOpportunities } from "@/context/OpportunitiesContext";
import { useAuth } from "@/context/AuthContext";
import type { OpportunityItem } from "@/context/OpportunitiesContext";
import { Loader2, MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 9;

function mapApiToProps(opp: OpportunityItem): OpportunityProps {
    return {
        id: opp.opportunity_id,
        title: opp.title ?? "",
        region: opp.region ?? "",
        summary: opp.summary ?? "",
        donationUrl: opp.donation?.donation_url ?? null,
        organizationWebsite: opp.organization?.website ?? null,
        isVerified: opp.organization?.verified,
        cause: opp.cause ?? null,
        values: opp.values ?? [],
    };
}

function formatCauseLabel(cause: string): string {
    return cause.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTag(s: string): string {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Trend global issues with suggested charity matched to region + cause (from charity_registry). */
const TREND_ISSUES = [
    {
        id: "trend-1",
        title: "Climate & displacement in East Africa",
        region: "East Africa",
        summary: "Drought and flooding are driving displacement and food insecurity across the region. Support emergency relief and long-term resilience.",
        cause: "climate",
        values: ["disaster_relief", "food_security"],
        isVerified: true,
        suggestedCharityId: "charity_004", // WFP – Sudan, Ethiopia, South Sudan, Somalia; food_security, disaster_relief
    },
    {
        id: "trend-2",
        title: "Ukraine humanitarian response",
        region: "Ukraine",
        summary: "Ongoing conflict continues to displace families. Medical aid, shelter, and food assistance are urgently needed.",
        cause: "conflict_relief",
        values: ["disaster_relief", "healthcare"],
        isVerified: true,
        suggestedCharityId: "charity_001", // IRC – Ukraine in regions; conflict_relief, healthcare, refugees
    },
    {
        id: "trend-3",
        title: "Syria and neighbouring countries refugee support",
        region: "Syria",
        summary: "Millions remain displaced. Education, health, and protection services need sustained funding.",
        cause: "refugees",
        values: ["education", "healthcare"],
        isVerified: true,
        suggestedCharityId: "charity_008", // Action For Humanity – Syria, Lebanon, Jordan, Türkiye; education, healthcare
    },
];

export default function Discover() {
    const { user, isAuthenticated } = useAuth();
    const { opportunities: rawOpportunities, isLoading: opportunitiesLoading } = useOpportunities();
    const [selectedCause, setSelectedCause] = useState<string>("all");
    const [selectedRegion, setSelectedRegion] = useState<string>("any");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const uniqueRegions = [...new Set(rawOpportunities.map((o) => o.region).filter(Boolean))].sort() as string[];
    const uniqueCauses = [...new Set(rawOpportunities.map((o) => o.cause).filter(Boolean))].sort() as string[];

    const filteredOpportunities = (() => {
        const isDefaultFilters = selectedCause === "all" && selectedRegion === "any";
        if (isDefaultFilters) {
            return rawOpportunities;
        }
        const filtered = rawOpportunities.filter((o) => {
            if (selectedCause !== "all" && (o.cause || "").toLowerCase() !== selectedCause.toLowerCase()) return false;
            if (selectedRegion !== "any" && (o.region || "") !== selectedRegion) return false;
            return true;
        });
        const parseDate = (s: string | null | undefined) => {
            if (!s) return 0;
            try {
                return new Date(s.replace("Z", "+00:00")).getTime();
            } catch {
                return 0;
            }
        };
        return [...filtered].sort((a, b) => parseDate(b.date_discovered) - parseDate(a.date_discovered));
    })();
    const [loadingMore, setLoadingMore] = useState(false);
    const [supportModalOpportunityId, setSupportModalOpportunityId] = useState<string | null>(null);
    const [supportModalTrendContent, setSupportModalTrendContent] = useState<{
        title: string;
        region: string;
        summary: string;
        cause: string;
        values: string[];
        suggestedCharityId: string;
    } | null>(null);
    const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

    const allOpportunities: OpportunityProps[] = filteredOpportunities.map(mapApiToProps);
    const loading = opportunitiesLoading;
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [hashFromUrl, setHashFromUrl] = useState<string>(() =>
        typeof window !== "undefined" ? (window.location.hash || "").replace(/^#/, "") : ""
    );

    useEffect(() => {
        const onHashChange = () => setHashFromUrl((window.location.hash || "").replace(/^#/, ""));
        window.addEventListener("hashchange", onHashChange);
        if (typeof window !== "undefined" && window.location.hash) {
            setHashFromUrl((window.location.hash || "").replace(/^#/, ""));
        }
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    useEffect(() => {
        if (!hashFromUrl) {
            setHighlightedId(null);
            return;
        }
        if (loading || allOpportunities.length === 0) return;
        const index = allOpportunities.findIndex((opp) => opp.id === hashFromUrl);
        if (index === -1) return;
        setHighlightedId(hashFromUrl);
        if (index >= visibleCount) {
            setVisibleCount(index + 1);
        }
        const scrollToCard = () => {
            const el = document.getElementById(`opp-${hashFromUrl}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        };
        const t = setTimeout(scrollToCard, index >= visibleCount ? 400 : 100);
        return () => clearTimeout(t);
    }, [loading, allOpportunities, hashFromUrl, visibleCount]);
    const hasMore = visibleCount < allOpportunities.length;
    const opportunities = allOpportunities.slice(0, visibleCount);

    const handleCauseChange = (value: string) => {
        setSelectedCause(value);
        setVisibleCount(PAGE_SIZE);
    };
    const handleRegionChange = (value: string) => {
        setSelectedRegion(value);
        setVisibleCount(PAGE_SIZE);
    };

    const loadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        loadMoreTimeoutRef.current = setTimeout(() => {
            loadMoreTimeoutRef.current = null;
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setLoadingMore(false);
        }, 1400);
    }, [loadingMore, hasMore]);
    useEffect(() => {
        return () => {
            if (loadMoreTimeoutRef.current) clearTimeout(loadMoreTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const sentinel = loadMoreSentinelRef.current;
        if (!sentinel || !hasMore || loading) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) loadMore();
            },
            { rootMargin: "200px", threshold: 0.1 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    const handleSupportClick = (opportunityId: string) => {
        setSupportModalOpportunityId(opportunityId);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            <SupportInitiativeModal
                opportunityId={supportModalOpportunityId}
                trendContent={supportModalTrendContent}
                onClose={() => {
                    setSupportModalOpportunityId(null);
                    setSupportModalTrendContent(null);
                }}
            />

            <div className="bg-primary text-primary-foreground pt-20 pb-28 lg:pb-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary opacity-50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526976663112-0059bf0cf736?q=80&w=2670&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="container mx-auto px-4 relative z-10 lg:pl-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-6 tracking-tight">Discover Impact</h1>
                    <p className="text-lg md:text-xl text-primary-foreground max-w-2xl leading-relaxed font-medium">Find verified humanitarian opportunities curated by AI based on urgency and your past support.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-12 relative z-20">
                <FilterBar
                    regions={uniqueRegions}
                    causes={uniqueCauses}
                    selectedCause={selectedCause}
                    selectedRegion={selectedRegion}
                    onCauseChange={handleCauseChange}
                    onRegionChange={handleRegionChange}
                    formatCauseLabel={formatCauseLabel}
                />
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-border/50 pb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold font-sans">Trending global issues</h2>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            Same style as your crisis feed—tap Support Initiative to open the modal.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {TREND_ISSUES.map((block) => {
                        const tags = [
                            block.cause ? formatTag(block.cause) : null,
                            ...(block.values || []).map(formatTag),
                        ].filter(Boolean) as string[];
                        const uniqueTags = [...new Set(tags)];
                        return (
                            <Card
                                key={block.id}
                                className="group overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl flex flex-col h-full"
                            >
                                <CardHeader className="p-5 pb-2">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {block.isVerified && (
                                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border border-primary/20">
                                                <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
                                            </span>
                                        )}
                                        {uniqueTags.map((t) => (
                                            <span key={t} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-[11px] font-medium">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-1.5 items-center text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                                        <span className="line-clamp-1">{block.region}</span>
                                    </div>
                                    <h3 className="font-sans font-bold text-xl leading-tight line-clamp-2 text-foreground">{block.title}</h3>
                                </CardHeader>
                                <CardContent className="p-5 pt-1 flex-grow">
                                    <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">{block.summary}</p>
                                </CardContent>
                                <CardFooter className="p-5 pt-0">
                                    <Button
                                        className="w-full h-11 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm"
                                        onClick={() => {
                                            setSupportModalOpportunityId(null);
                                            setSupportModalTrendContent({
                                                title: block.title,
                                                region: block.region,
                                                summary: block.summary,
                                                cause: block.cause,
                                                values: block.values,
                                                suggestedCharityId: block.suggestedCharityId,
                                            });
                                        }}
                                    >
                                        Support Initiative
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <div id="crisis-feed" className="container mx-auto px-4 lg:px-8 mt-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-border/50 pb-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-sans">
                            {isAuthenticated && user ? "Your Crisis Feed" : "Live Crisis Feed"}
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            {isAuthenticated && user
                                ? "Crises matched to your causes and regions—most relevant first."
                                : "Sign in to see crises tailored to your causes and regions."}
                        </p>
                    </div>
                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-primary/20 w-fit">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(225,28,35,0.6)]" /> Live Updates
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : opportunities.length === 0 ? (
                    <p className="text-muted-foreground font-medium py-12">No opportunities yet.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                            {opportunities.map((opp) => (
                                <OpportunityCard
                                    key={opp.id}
                                    data={opp}
                                    onSupportClick={handleSupportClick}
                                    highlighted={highlightedId === opp.id}
                                />
                            ))}
                        </div>
                        <div ref={loadMoreSentinelRef} className="h-4 min-h-4 w-full" aria-hidden />
                        {loadingMore && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
