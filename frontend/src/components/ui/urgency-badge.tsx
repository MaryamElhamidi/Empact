import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UrgencyLevel = "CRITICAL" | "HIGH" | "MODERATE";

export function UrgencyBadge({ level, className }: { level: UrgencyLevel; className?: string }) {
    const styles = {
        CRITICAL: "bg-primary text-primary-foreground animate-pulse shadow-[0_0_10px_rgba(225,28,35,0.5)]",
        HIGH: "bg-secondary text-secondary-foreground",
        MODERATE: "bg-accent text-accent-foreground",
    };

    return (
        <Badge variant="outline" className={cn("px-2.5 py-1 text-[11px] font-bold tracking-wider border-none rounded-full uppercase", styles[level], className)}>
            {level}
        </Badge>
    );
}
