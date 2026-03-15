"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FilterBar } from "@/components/discover/FilterBar";
import { OpportunityCard, OpportunityProps } from "@/components/discover/OpportunityCard";
import { api } from "@/lib/api";
import { useOpportunities } from "@/context/OpportunitiesContext";
import { useAuth } from "@/context/AuthContext";
import type { OpportunityItem } from "@/context/OpportunitiesContext";
import { Loader2, X, ExternalLink } from "lucide-react";

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

export default function Discover() {
    const { user, isAuthenticated } = useAuth();
    const { opportunities: rawOpportunities, isLoading: opportunitiesLoading } = useOpportunities();
    const [selectedCause, setSelectedCause] = useState<string>("all");
    const [selectedRegion, setSelectedRegion] = useState<string>("any");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [topIssues, setTopIssues] = useState<Array<{ name: string; icon: string; count: number }>>([]);

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
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [relatedOpportunityId, setRelatedOpportunityId] = useState<string | null>(null);
    const [relatedCharities, setRelatedCharities] = useState<Array<{ charity_id: string; name: string; website: string | null; donation_url: string | null }>>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
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

    useEffect(() => {
        api.getGlobalIssues()
            .then(setTopIssues)
            .catch(() => setTopIssues([]))
            .finally(() => setIssuesLoading(false));
    }, []);

    useEffect(() => {
        if (!relatedOpportunityId) {
            setRelatedCharities([]);
            return;
        }
        setRelatedLoading(true);
        api.getRelatedCharities(relatedOpportunityId)
            .then(setRelatedCharities)
            .catch(() => setRelatedCharities([]))
            .finally(() => setRelatedLoading(false));
    }, [relatedOpportunityId]);

    const handleSupportClick = (opportunityId: string) => {
        setRelatedOpportunityId(opportunityId);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            {/* Related charities popup – top right */}
            {relatedOpportunityId && (
                <div className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-xl p-4 animate-in slide-in-from-right-5 duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-foreground">Charities with same causes</h3>
                        <button
                            type="button"
                            onClick={() => setRelatedOpportunityId(null)}
                            className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {relatedLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : relatedCharities.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No related charities found.</p>
                    ) : (
                        <ul className="space-y-2">
                            {relatedCharities.map((c) => (
                                <li key={c.charity_id}>
                                    <a
                                        href={c.donation_url || c.website || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                    >
                                        <span className="line-clamp-1">{c.name}</span>
                                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

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
                            <p className="text-muted-foreground font-medium py-8">No issues loaded.</p>
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
