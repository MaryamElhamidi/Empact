"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

export function FilterBar() {
    const causes = ["All Causes", "Disaster Relief", "Climate Crisis", "Healthcare", "Education", "Food Security"];

    return (
        <div className="flex flex-col md:flex-row gap-5 items-center bg-card p-4 rounded-2xl border border-border shadow-sm w-full">
            <div className="flex items-center gap-3 w-full md:w-auto md:pr-4 md:border-r border-border/60 shrink-0">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary hidden md:block">
                    <SlidersHorizontal className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm tracking-wide">Filters:</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full flex-grow">
                <Select defaultValue="all">
                    <SelectTrigger className="rounded-xl h-12 border-border/80 font-semibold bg-muted/40 focus:ring-primary/20 transition-all hover:bg-muted/80">
                        <SelectValue placeholder="Cause" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-medium">
                        <SelectItem value="all" className="rounded-lg">All Causes</SelectItem>
                        <SelectItem value="disaster-relief" className="rounded-lg">Disaster Relief</SelectItem>
                        <SelectItem value="climate-crisis" className="rounded-lg">Climate Crisis</SelectItem>
                        <SelectItem value="healthcare" className="rounded-lg">Healthcare</SelectItem>
                        <SelectItem value="education" className="rounded-lg">Education</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="any">
                    <SelectTrigger className="rounded-xl h-12 border-border/80 font-semibold bg-muted/40 focus:ring-primary/20 transition-all hover:bg-muted/80">
                        <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-medium">
                        <SelectItem value="any" className="rounded-lg">Any Region</SelectItem>
                        <SelectItem value="asia" className="rounded-lg">Asia</SelectItem>
                        <SelectItem value="africa" className="rounded-lg">Africa</SelectItem>
                        <SelectItem value="middle-east" className="rounded-lg">Middle East</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="critical">
                    <SelectTrigger className="rounded-xl h-12 border-border/80 font-semibold bg-muted/40 focus:ring-primary/20 transition-all hover:bg-muted/80">
                        <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-medium">
                        <SelectItem value="all" className="rounded-lg">Any Urgency</SelectItem>
                        <SelectItem value="critical" className="rounded-lg text-destructive font-bold">Critical</SelectItem>
                        <SelectItem value="high" className="rounded-lg text-secondary font-bold">High</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="newest">
                    <SelectTrigger className="rounded-xl h-12 border-border/80 font-semibold bg-primary/5 border-primary/20 text-primary focus:ring-primary/20 transition-all hover:bg-primary/10">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-medium">
                        <SelectItem value="newest" className="rounded-lg">Sort: Newest First</SelectItem>
                        <SelectItem value="trending" className="rounded-lg">Sort: Trending</SelectItem>
                        <SelectItem value="ending-soon" className="rounded-lg">Sort: Ending Soon</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
