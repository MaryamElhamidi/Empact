"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { CrisisCard } from "@/components/home/CrisisCard";
import { UrgencyLevel } from "@/components/ui/urgency-badge";
import { api } from "@/lib/api";

const fallbackCrisis = {
  title: "Emergency Medical Aid - Gaza",
  location: "Gaza",
  summary: "Hospitals urgently need medical supplies and fuel to continue operations.",
  urgency: "CRITICAL" as const,
  imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop",
};

interface CrisisData {
  title: string;
  location: string;
  summary: string;
  urgency: UrgencyLevel;
  imageUrl: string;
}

export function FeaturedCrisisSection() {
  const [data, setData] = useState<CrisisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getFeaturedOpportunity()
      .then((row) => {
        if (row) {
          setData({
            title: row.title,
            location: row.location || row.country || "",
            summary: row.summary || "",
            urgency: (row.urgency === "HIGH" || row.urgency === "MODERATE" ? row.urgency : "CRITICAL") as UrgencyLevel,
            imageUrl: row.imageUrl || fallbackCrisis.imageUrl,
          });
        } else {
          setData(fallbackCrisis);
        }
      })
      .catch(() => setData(fallbackCrisis))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="w-full py-24 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold font-sans text-foreground mb-4">Featured Crisis</h2>
            <p className="text-muted-foreground text-xl font-medium">Urgent action needed right now.</p>
          </div>
          <Link href="/discover" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors bg-primary/5 px-6 py-3 rounded-full hover:bg-primary/10 w-fit">
            View all crises <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <CrisisCard data={data} />

        <div className="mt-12 sm:hidden flex justify-center">
          <Link href="/discover" className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors bg-primary/5 px-8 py-4 rounded-full w-full justify-center">
            View all crises <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
