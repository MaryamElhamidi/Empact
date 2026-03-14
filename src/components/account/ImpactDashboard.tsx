import { ImpactStatCard } from "./ImpactStatCard";
import { DollarSign, Users, Globe2, TrendingUp } from "lucide-react";

export function ImpactDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <h2 className="text-2xl font-bold font-sans">Your Lifetime Impact</h2>
                <div className="flex items-center gap-2 text-sm font-bold text-accent bg-accent/10 px-4 py-2 rounded-full w-fit">
                    <TrendingUp className="h-4.5 w-4.5" /> Top 15% of Donors
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImpactStatCard
                    title="Total Donated"
                    value="$1,240"
                    icon={<DollarSign className="h-6 w-6" />}
                    trend="+12% this month"
                />
                <ImpactStatCard
                    title="People Helped"
                    value="142"
                    icon={<Users className="h-6 w-6" />}
                    trend="Across 8 initiatives"
                />
                <ImpactStatCard
                    title="Countries Supported"
                    value="5"
                    icon={<Globe2 className="h-6 w-6" />}
                />
            </div>
        </div>
    );
}
