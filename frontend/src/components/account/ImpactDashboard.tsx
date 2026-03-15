"use client";

import { useState, useEffect } from "react";
import { ImpactStatCard } from "./ImpactStatCard";
import { DollarSign, Users, Globe2, TrendingUp, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ImpactDashboardProps {
  userId: number;
}

export function ImpactDashboard({ userId }: ImpactDashboardProps) {
  const [stats, setStats] = useState<{ totalDonated: number; peopleHelped: number; countriesSupported: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getImpactStats(userId)
      .then(setStats)
      .catch(() => setStats({ totalDonated: 0, peopleHelped: 0, countriesSupported: 0 }))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

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
          value={`$${stats.totalDonated.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <ImpactStatCard
          title="People Helped"
          value={stats.peopleHelped.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
        />
        <ImpactStatCard
          title="Countries Supported"
          value={String(stats.countriesSupported)}
          icon={<Globe2 className="h-6 w-6" />}
        />
      </div>
    </div>
  );
}
