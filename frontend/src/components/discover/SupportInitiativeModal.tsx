"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DonateAmountModal } from "@/components/discover/DonateAmountModal";

function formatTag(s: string): string {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(s: string | null | undefined): string {
    if (!s) return "";
    try {
        const d = new Date(s.replace("Z", "+00:00"));
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return String(s);
    }
}

/** Remove AI citation placeholders e.g. :contentReference[oaicite:4]{index=4} from text. */
function stripContentReference(text: string): string {
    return text.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, "").trim();
}

export interface SupportModalOpportunity {
    opportunity_id: string;
    title: string;
    summary: string | null;
    cause: string | null;
    values?: string[] | null;
    region: string | null;
    date_discovered?: string | null;
    source_url?: string | null;
    donation?: { charity_id?: string; charityId?: string; donation_url?: string };
}

interface CharityInfo {
    charity_id: string;
    name: string;
    description?: string;
    donation_url?: string;
    regions?: string[];
    focus_values?: string[];
    verified?: boolean;
}

export interface TrendContent {
    title: string;
    region: string;
    summary: string;
    cause: string;
    values: string[];
    /** charity_id from charity_registry (e.g. charity_003 for UNICEF). Fetched and shown as AI Suggested Charity. */
    suggestedCharityId: string;
}

interface SupportInitiativeModalProps {
    /** Opportunity id (e.g. opp_xxx). Modal fetches the full opportunity from the API to get donation.charity_id, then fetches that charity. */
    opportunityId: string | null;
    /** When set, show this trend-issue with AI Suggested Charity (fetched by suggestedCharityId). Same modal format as opportunity. */
    trendContent?: TrendContent | null;
    onClose: () => void;
}

export function SupportInitiativeModal({ opportunityId, trendContent = null, onClose }: SupportInitiativeModalProps) {
    const { user } = useAuth();
    const [opportunity, setOpportunity] = useState<SupportModalOpportunity | null>(null);
    const [opportunityLoading, setOpportunityLoading] = useState(false);
    const [charity, setCharity] = useState<CharityInfo | null>(null);
    const [charityLoading, setCharityLoading] = useState(false);
    const [showDonateAmount, setShowDonateAmount] = useState(false);
    const [donateLoading, setDonateLoading] = useState(false);
    const [donateProgress, setDonateProgress] = useState<string | null>(null);

    useEffect(() => {
        if (trendContent) {
            setOpportunity(null);
            setCharity(null);
            setCharityLoading(true);
            api.getCharityById(trendContent.suggestedCharityId)
                .then(setCharity)
                .catch(() => setCharity(null))
                .finally(() => setCharityLoading(false));
            return;
        }
        if (!opportunityId) {
            setOpportunity(null);
            setCharity(null);
            return;
        }
        setOpportunityLoading(true);
        setOpportunity(null);
        setCharity(null);
        api.getOpportunityById(opportunityId)
            .then((data: SupportModalOpportunity) => {
                setOpportunity(data);
                const donation = data?.donation;
                const charityId = (donation?.charity_id ?? donation?.charityId ?? "").toString().trim();
                if (!charityId) return;
                setCharityLoading(true);
                api.getCharityById(charityId)
                    .then(setCharity)
                    .catch(() => setCharity(null))
                    .finally(() => setCharityLoading(false));
            })
            .catch(() => setOpportunity(null))
            .finally(() => setOpportunityLoading(false));
    }, [opportunityId, trendContent]);

    const isTrend = !!trendContent;
    const isOpen = !!opportunityId || isTrend;

    if (!isOpen) return null;

    if (isTrend && trendContent) {
        const tags = [formatTag(trendContent.cause), ...(trendContent.values || []).map(formatTag)];
        const donationUrl = charity?.donation_url;
        return (
            <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-end p-3 border-b border-border/60 shrink-0">
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 px-6 pb-8">
                        <div className="flex flex-wrap items-start gap-2 justify-between mb-2">
                            <h2 className="text-xl font-bold text-foreground leading-tight pr-2">{trendContent.title}</h2>
                            <div className="flex flex-wrap gap-1.5 shrink-0">
                                {tags.map((t) => (
                                    <span key={t} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs font-medium">{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {trendContent.region}
                            </span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">{trendContent.summary}</p>
                        <Separator className="my-6" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">AI Suggested Charity</h3>
                        {charityLoading ? (
                            <div className="flex items-center gap-2 py-4 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading charity…</span>
                            </div>
                        ) : charity ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-bold text-foreground">{charity.name}</span>
                                    {(charity.focus_values || []).map((v) => (
                                        <span key={v} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-medium">
                                            {formatTag(v)}
                                        </span>
                                    ))}
                                </div>
                                {(charity.regions || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {(charity.regions || []).slice(0, 6).map((r) => (
                                            <span key={r} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">{r}</span>
                                        ))}
                                    </div>
                                )}
                                {charity.description && (
                                    <p className="text-sm text-foreground/80 leading-relaxed mb-6">{stripContentReference(charity.description)}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground py-2">No suggested charity for this issue.</p>
                        )}
                        <Button
                            className="w-full h-12 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!donationUrl || !user?.profile?.email || donateLoading}
                            onClick={() => setShowDonateAmount(true)}
                        >
                            {donateLoading ? "Running…" : "Donate Now"}
                        </Button>
                        {donateLoading && donateProgress && (
                            <p className="mt-3 text-sm text-muted-foreground text-center">{donateProgress}</p>
                        )}
                    </div>
                </div>
            </div>
            {showDonateAmount && (
                <DonateAmountModal
                    onClose={() => setShowDonateAmount(false)}
                    onConfirm={async (amount) => {
                        const email = user?.profile?.email;
                        if (!donationUrl || !email) return;
                        setDonateLoading(true);
                        setDonateProgress(null);
                        setShowDonateAmount(false);
                        try {
                            await api.donate(email, donationUrl, amount, (msg) => setDonateProgress(msg), { organizationName: charity?.name });
                        } finally {
                            setDonateLoading(false);
                        }
                    }}
                />
            )}
        </>
        );
    }

    if (opportunityLoading || !opportunity) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="font-medium">Loading opportunity…</span>
                </div>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </div>
        );
    }

    const causeNorm = (opportunity.cause || "").toLowerCase().replace(/\s+/g, "_");
    const causeFormatted = opportunity.cause ? formatTag(opportunity.cause) : null;
    const valuesFormatted = (opportunity.values || [])
        .filter((v) => v && (v.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_") !== causeNorm))
        .map(formatTag);
    const oppTags = [...(causeFormatted ? [causeFormatted] : []), ...valuesFormatted];

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-end p-3 border-b border-border/60 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-8">
                    <div className="flex flex-wrap items-start gap-2 justify-between mb-2">
                        <h2 className="text-xl font-bold text-foreground leading-tight pr-2">
                            {opportunity.title}
                        </h2>
                        <div className="flex flex-wrap gap-1.5 shrink-0">
                            {oppTags.map((t) => (
                                <span key={t} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        {opportunity.region && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {opportunity.region}
                            </span>
                        )}
                        {opportunity.date_discovered && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(opportunity.date_discovered)}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">
                        {opportunity.summary || "No summary available."}
                    </p>

                    {opportunity.source_url && (
                        <a
                            href={opportunity.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                            Source <ExternalLink className="h-4 w-4" />
                        </a>
                    )}

                    <Separator className="my-6" />

                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        AI Suggested Charity
                    </h3>

                    {charityLoading ? (
                        <div className="flex items-center gap-2 py-4 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Loading charity…</span>
                        </div>
                    ) : charity ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-bold text-foreground">{charity.name}</span>
                                {(charity.focus_values || []).map((v) => (
                                    <span key={v} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-medium">
                                        {formatTag(v)}
                                    </span>
                                ))}
                            </div>
                            {(charity.regions || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(charity.regions || []).slice(0, 6).map((r) => (
                                        <span key={r} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {charity.description && (
                                <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                                    {stripContentReference(charity.description)}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground py-2">No suggested charity for this opportunity.</p>
                    )}

                    <Button
                        className="w-full h-12 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={!charity?.donation_url || !user?.profile?.email || donateLoading}
                        onClick={() => setShowDonateAmount(true)}
                    >
                        {donateLoading ? "Running…" : "Donate Now"}
                    </Button>
                    {donateLoading && donateProgress && (
                        <p className="mt-3 text-sm text-muted-foreground text-center">{donateProgress}</p>
                    )}
                </div>
            </div>
        </div>
        {showDonateAmount && (
            <DonateAmountModal
                onClose={() => setShowDonateAmount(false)}
                onConfirm={async (amount) => {
                    const email = user?.profile?.email;
                    const url = charity?.donation_url;
                    if (!url || !email) return;
                    setDonateLoading(true);
                    setDonateProgress(null);
                    setShowDonateAmount(false);
                    try {
                        await api.donate(email, url, amount, (msg) => setDonateProgress(msg), { organizationName: charity?.name });
                    } finally {
                        setDonateLoading(false);
                    }
                }}
            />
        )}
    </>
    );
}
