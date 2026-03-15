"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
    regions: string[];
    causes: string[];
    selectedCause: string;
    selectedRegion: string;
    onCauseChange: (value: string | null) => void;
    onRegionChange: (value: string | null) => void;
    formatCauseLabel: (cause: string) => string;
}

export function FilterBar({
    regions,
    causes,
    selectedCause,
    selectedRegion,
    onCauseChange,
    onRegionChange,
    formatCauseLabel,
}: FilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-5 items-center bg-card p-4 rounded-2xl border border-border shadow-sm w-full">
            <div className="flex items-center gap-3 w-full md:w-auto md:pr-4 md:border-r border-border/60 shrink-0">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary hidden md:block">
                    <SlidersHorizontal className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm tracking-wide">Filters:</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full flex-grow">
                <Select value={selectedCause} onValueChange={onCauseChange}>
                    <SelectTrigger className="rounded-xl h-12 border-border/80 font-semibold bg-muted/40 focus:ring-primary/20 transition-all hover:bg-muted/80">
                        <SelectValue placeholder="Cause">
                            {selectedCause === "all" ? "All Causes" : formatCauseLabel(selectedCause)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-medium max-h-[280px] overflow-y-auto">
                        <SelectItem value="all" className="rounded-lg">All Causes</SelectItem>
                        {causes.map((cause) => (
                            <SelectItem key={cause} value={cause} className="rounded-lg">
                                {formatCauseLabel(cause)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={onRegionChange}>
                    <SelectTrigger className="rounded-xl h-12 border-border/80 font-semibold bg-muted/40 focus:ring-primary/20 transition-all hover:bg-muted/80">
                        <SelectValue placeholder="Region">
                            {selectedRegion === "any" ? "Any Region" : selectedRegion}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-medium max-h-[280px] overflow-y-auto">
                        <SelectItem value="any" className="rounded-lg">Any Region</SelectItem>
                        {regions.map((region) => (
                            <SelectItem key={region} value={region} className="rounded-lg">
                                {region}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
