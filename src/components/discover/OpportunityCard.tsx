import { MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { UrgencyBadge, UrgencyLevel } from "@/components/ui/urgency-badge";
import { AIRecommendationTag } from "@/components/ui/ai-recommendation-tag";
import { Button } from "@/components/ui/button";

export interface OpportunityProps {
    id: string;
    title: string;
    country: string;
    summary: string;
    urgency: UrgencyLevel;
    imageUrl: string;
    recommendation?: string;
    isVerified?: boolean;
}

export function OpportunityCard({ data }: { data: OpportunityProps }) {
    return (
        <Card className="group overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl flex flex-col h-full">
            <div className="relative h-56 w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.imageUrl} alt={data.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <UrgencyBadge level={data.urgency} />
                    {data.isVerified && (
                        <div className="bg-white/95 backdrop-blur-md text-primary px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> VERIFIED
                        </div>
                    )}
                </div>
            </div>
            <CardHeader className="p-5 pb-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                    {data.country}
                </div>
                <h3 className="font-sans font-bold text-xl leading-tight line-clamp-2 text-foreground">{data.title}</h3>
            </CardHeader>
            <CardContent className="p-5 pt-1 flex-grow">
                <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">{data.summary}</p>
                {data.recommendation && <AIRecommendationTag explanation={data.recommendation} />}
            </CardContent>
            <CardFooter className="p-5 pt-0">
                <Button className="w-full h-11 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm">
                    Support Initiative
                </Button>
            </CardFooter>
        </Card>
    );
}
