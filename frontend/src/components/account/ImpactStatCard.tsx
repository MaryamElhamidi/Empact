import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImpactStatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    className?: string;
}

export function ImpactStatCard({ title, value, icon, trend, className }: ImpactStatCardProps) {
    return (
        <Card className={cn("overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 rounded-2xl", className)}>
            <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {title}
                        </p>
                        <h4 className="text-3xl md:text-4xl font-sans font-bold text-foreground">
                            {value}
                        </h4>
                        {trend && (
                            <p className="text-sm font-medium text-accent mt-3 flex items-center gap-1.5 bg-accent/10 px-2.5 py-1 rounded-full w-fit">
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className="p-3.5 bg-primary/5 rounded-2xl text-primary shadow-sm border border-primary/10">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
