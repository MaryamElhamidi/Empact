import { Globe } from "@/components/ui/globe";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { FeaturedCrisisSection } from "@/components/home/FeaturedCrisisSection";
import Link from "next/link";

export default function Home() {
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

      <FeaturedCrisisSection />
    </div>
  );
}
