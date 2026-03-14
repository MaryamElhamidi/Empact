import { Sparkles } from "lucide-react";

export function AIRecommendationTag({ explanation }: { explanation: string }) {
    return (
        <div className="flex flex-col gap-1.5 mt-4 p-3.5 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
            </div>
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider relative z-10">
                Recommended for you
            </div>
            <p className="text-sm text-foreground/80 font-medium relative z-10 leading-snug">{explanation}</p>
        </div>
    );
}
