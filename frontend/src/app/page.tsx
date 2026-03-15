import { Globe } from "@/components/ui/globe";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CrisisCard } from "@/components/home/CrisisCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredCrisis = {
    title: "Emergency Medical Aid - Gaza",
    location: "Gaza",
    summary: "Hospitals urgently need medical supplies and fuel to continue operations.",
    urgency: "CRITICAL" as const,
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative flex flex-col items-center justify-start w-full min-h-[90vh] md:min-h-screen overflow-hidden bg-background pt-20 md:pt-32 pb-24 border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.02)_0%,transparent_100%)]" />

        <div className="container mx-auto px-4 relative z-20 flex flex-col items-center text-center mb-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight leading-[1.1] text-foreground drop-shadow-sm">
            See the world.<br className="hidden md:block" />
            <span className="text-primary relative inline-block mt-1">
              Change the outcome
              <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-secondary/60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.00033 7.00002C45.2891 2.37568 126.969 -2.57143 198 6.99999" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </h1>
        </div>

        <div className="relative flex w-full max-w-[800px] lg:max-w-[1000px] items-center justify-center z-10 -my-20 md:-my-32">
          <div className="w-full aspect-square relative">
            <Globe className="scale-100 md:scale-110" />
            <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(255,255,255,0.4)_70%,white_100%)]" />
          </div>
        </div>

        <div className="relative z-20 mt-8">
          <Link href="/discover">
            <InteractiveHoverButton className="bg-primary text-white h-14 sm:h-16 px-8 sm:px-12 text-lg font-bold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
              Start Making Impact
            </InteractiveHoverButton>
          </Link>
        </div>
      </section>



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

          <CrisisCard data={featuredCrisis} />

          <div className="mt-12 sm:hidden flex justify-center">
            <Link href="/discover" className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors bg-primary/5 px-8 py-4 rounded-full w-full justify-center">
              View all crises <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
