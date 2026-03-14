import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { UrgencyBadge, UrgencyLevel } from "@/components/ui/urgency-badge";
import { MapPin, Info } from "lucide-react";

export interface CrisisProps {
    title: string;
    location: string;
    summary: string;
    urgency: UrgencyLevel;
    imageUrl: string;
}

export function CrisisCard({ data }: { data: CrisisProps }) {
    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-card shadow-lg flex flex-col lg:flex-row group border border-border">
            <div className="lg:w-[45%] relative h-[300px] lg:h-auto overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.imageUrl} alt={data.title} className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />

                <div className="absolute bottom-6 left-6 lg:hidden">
                    <UrgencyBadge level={data.urgency} className="mb-2" />
                    <div className="flex items-center gap-1.5 text-sm text-white font-medium">
                        <MapPin className="h-4 w-4 text-secondary" /> {data.location}
                    </div>
                </div>
            </div>
            <div className="p-8 lg:p-12 lg:w-[55%] flex flex-col justify-center">
                <div className="hidden lg:flex items-center justify-between mb-6">
                    <UrgencyBadge level={data.urgency} />
                    <div className="flex items-center gap-2 text-sm text-foreground/80 font-semibold bg-muted px-4 py-1.5 rounded-full">
                        <MapPin className="h-4 w-4 text-secondary" /> {data.location}
                    </div>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold font-sans text-foreground mb-4 leading-tight">
                    {data.title}
                </h2>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-8 flex gap-3 items-start">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-foreground/80 leading-relaxed font-medium">
                        <span className="font-bold text-primary">AI Summary:</span> {data.summary}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-auto">
                    <InteractiveHoverButton className="px-6 py-3 text-sm h-12 bg-primary text-primary-foreground shadow-sm">
                        Donate $10
                    </InteractiveHoverButton>
                    <InteractiveHoverButton className="px-6 py-3 text-sm h-12 bg-primary text-primary-foreground shadow-sm">
                        Donate $25
                    </InteractiveHoverButton>
                    <InteractiveHoverButton className="px-6 py-3 text-sm h-12 bg-secondary text-secondary-foreground hover:shadow-secondary/30">
                        Donate $50
                    </InteractiveHoverButton>
                </div>
            </div>
        </div>
    );
}
