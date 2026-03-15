"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import type { UserData } from "@/lib/user-store";

/** Backend opportunity shape (opportunity_id, region, cause, etc.) */
export interface OpportunityItem {
  opportunity_id: string;
  title: string;
  summary: string | null;
  cause: string | null;
  region: string | null;
  organization?: { name?: string; website?: string; verified?: boolean };
  donation?: { donation_url?: string; charity_id?: string; suggested_amounts?: number[] };
  values?: string[];
  ai_confidence_score?: number | null;
  date_discovered?: string | null;
  source_url?: string | null;
}

interface OpportunitiesContextType {
  opportunities: OpportunityItem[];
  isLoading: boolean;
  error: string | null;
  /** Fetch opportunities ordered by relevancy for the logged-in user (causes + regions). Call after login. */
  fetchForUser: (user: UserData | null) => Promise<void>;
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

export function OpportunitiesProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForUser = useCallback(async (user: UserData | null) => {
    setIsLoading(true);
    setError(null);
    try {
      if (user?.profile?.causes?.length || user?.profile?.locations?.length) {
        const causes = user.profile.causes?.length ? user.profile.causes.join(",") : "";
        const regions = user.profile.locations?.length ? user.profile.locations.join(",") : "";
        const list = await api.getOpportunities({ causes, regions });
        setOpportunities(Array.isArray(list) ? list : []);
      } else {
        const list = await api.getOpportunities();
        setOpportunities(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load opportunities");
      setOpportunities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <OpportunitiesContext.Provider value={{ opportunities, isLoading, error, fetchForUser }}>
      {children}
    </OpportunitiesContext.Provider>
  );
}

export function useOpportunities() {
  const context = useContext(OpportunitiesContext);
  if (context === undefined) {
    throw new Error("useOpportunities must be used within an OpportunitiesProvider");
  }
  return context;
}
