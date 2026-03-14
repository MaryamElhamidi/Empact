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
      <section className="relative w-full overflow-hidden bg-background pt-8 pb-32 lg:pt-16 lg:pb-48">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.03)_0%,transparent_100%)]" />
        <div className="container mx-auto px-4 flex flex-col items-center relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] -z-10 w-full max-w-[1200px] flex justify-center pointer-events-none opacity-40 md:opacity-100 mt-20 md:mt-10">
            <Globe />
          </div>

          <div className="text-center max-w-[5rem] md:max-w-4xl mx-auto mt-20 md:mt-32 p-8 shadow-2xl shadow-primary/5 md:shadow-none bg-white/70 backdrop-blur-3xl md:bg-transparent md:backdrop-blur-none rounded-[3rem] w-[95%]">
            <h1 className="text-5xl sm:text-6xl md:text-[5rem] lg:text-[6rem] font-bold font-sans tracking-tight leading-[1.05] text-foreground mb-6 md:mb-8">
              See the world.<br className="hidden md:block" />
              <span className="text-primary relative inline-block mt-2">
                Change the outcome
                <svg className="absolute w-full h-3 md:h-4 -bottom-1 md:-bottom-2 left-0 text-secondary opacity-80" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.00033 7.00002C45.2891 2.37568 126.969 -2.57143 198 6.99999" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-10 max-w-2xl mx-auto leading-relaxed md:leading-normal text-foreground drop-shadow-sm bg-white/40 md:bg-transparent rounded-2xl px-4 py-2">
              AI-powered humanitarian discovery connecting people to real-world impact seamlessly.
            </p>
            <Link href="/discover" className="inline-block">
              <InteractiveHoverButton className="bg-primary text-white h-16 sm:h-20 px-8 sm:px-12 text-lg sm:text-xl rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/40">
                Start Making Impact
              </InteractiveHoverButton>
            </Link>
          </div>
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
