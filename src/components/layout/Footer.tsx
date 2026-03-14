import { Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card py-16 lg:py-20 mt-auto">
            <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-8">
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        <span className="font-logo text-2xl font-bold mt-1">P</span>
                    </div>
                    <span className="font-logo text-2xl font-bold mt-1">EmPact</span>
                </div>
                <p className="text-muted-foreground text-center font-medium max-w-sm leading-relaxed">
                    AI-powered humanitarian discovery connecting people to real-world impact seamlessly.
                </p>
                <div className="flex items-center gap-2 text-sm text-foreground/70 font-bold mt-4 bg-muted/50 px-6 py-3 rounded-full border border-border/50">
                    Built with <Heart className="w-4 h-4 text-destructive fill-destructive mx-1 animate-bounce" /> for HackCanada
                </div>
            </div>
        </footer>
    );
}
