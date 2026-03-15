"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOpportunities } from "@/context/OpportunitiesContext";

/**
 * Runs relevance-ordered opportunities fetch whenever the logged-in user is set.
 * So after login, after register, or on load if already logged in, opportunities are
 * fetched with the user's causes and regions (from profile / backend interests & locations).
 */
export function OpportunitiesFetchOnLogin() {
  const { user } = useAuth();
  const { fetchForUser } = useOpportunities();

  useEffect(() => {
    fetchForUser(user ?? null);
  }, [user, fetchForUser]);

  return null;
}
