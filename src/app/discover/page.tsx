import { FilterBar } from "@/components/discover/FilterBar";
import { OpportunityCard, OpportunityProps } from "@/components/discover/OpportunityCard";

export default function Discover() {
    const opportunities: OpportunityProps[] = [
        {
            id: "1",
            title: "Flood Relief – Bangladesh",
            country: "Bangladesh",
            summary: "Thousands displaced by monsoon floods. Emergency shelters, clean water, and food supplies are urgently needed.",
            urgency: "HIGH",
            imageUrl: "https://images.unsplash.com/photo-1542385262-cdf06b2bf4da?q=80&w=2670&auto=format&fit=crop",
            isVerified: true,
            recommendation: "You previously supported disaster relief efforts in Asia.",
        },
        {
            id: "2",
            title: "Earthquake Recovery – Turkey",
            country: "Turkey",
            summary: "Rebuilding homes and providing temporary winter shelters for families who lost everything in the devastating quakes.",
            urgency: "CRITICAL",
            imageUrl: "https://images.unsplash.com/photo-1555529902-526de8ea2d1d?q=80&w=2670&auto=format&fit=crop",
            isVerified: true,
        },
        {
            id: "3",
            title: "Drought Famine Prevention",
            country: "Sub-Saharan Africa",
            summary: "Providing emergency food rations and clean water access to communities facing severe multi-year droughts.",
            urgency: "MODERATE",
            imageUrl: "https://images.unsplash.com/photo-1596409893991-53b05fccdb98?q=80&w=2671&auto=format&fit=crop",
            isVerified: true,
        },
        {
            id: "4",
            title: "Refugee Support Initiative",
            country: "Jordan",
            summary: "Supplying warm clothing, schooling materials, and healthcare to families in refugee camps.",
            urgency: "HIGH",
            imageUrl: "https://images.unsplash.com/photo-1533222481259-ce20eda1e20b?q=80&w=2670&auto=format&fit=crop",
            isVerified: true,
        }
    ];

    const topIssues = [
        { name: "Disaster Relief", icon: "🌋", count: 124 },
        { name: "Climate Crisis", icon: "🌍", count: 86 },
        { name: "Healthcare", icon: "⚕️", count: 210 },
        { name: "Education", icon: "📚", count: 145 },
        { name: "Food Security", icon: "🌾", count: 312 },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            <div className="bg-primary text-primary-foreground pt-20 pb-28 lg:pb-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526976663112-0059bf0cf736?q=80&w=2670&auto=format&fit=crop')] opacity-15 bg-cover bg-center mix-blend-overlay" />
                <div className="container mx-auto px-4 relative z-10 lg:pl-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-6 tracking-tight">Discover Impact</h1>
                    <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed font-medium">Find verified humanitarian opportunities curated by AI based on urgency and your past support.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-12 relative z-20">
                <FilterBar />
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold font-sans">Top Global Issues</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x">
                    {topIssues.map((issue) => (
                        <div key={issue.name} className="flex-shrink-0 w-72 p-8 rounded-3xl border border-border bg-card shadow-sm snap-start hover:-translate-y-2 transition-transform cursor-pointer group">
                            <div className="text-5xl mb-6 transition-transform group-hover:scale-110 origin-left">{issue.icon}</div>
                            <h3 className="font-bold text-xl mb-2">{issue.name}</h3>
                            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">{issue.count} Opportunities</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-20">
                <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-6">
                    <h2 className="text-3xl md:text-4xl font-bold font-sans">Live Crisis Feed</h2>
                    <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-secondary/20">
                        <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(251,100,21,0.6)]" /> Live Updates
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {opportunities.map((opp) => (
                        <OpportunityCard key={opp.id} data={opp} />
                    ))}
                </div>
            </div>
        </div>
    );
}
