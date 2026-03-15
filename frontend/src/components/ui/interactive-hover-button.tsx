"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
    children: React.ReactNode;
}

export function InteractiveHoverButton({ children, className, ...props }: InteractiveHoverButtonProps) {
    return (
        <motion.button
            whileHover="hover"
            initial="initial"
            className={cn(
                "group relative flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 font-sans text-base font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2 group-hover:-translate-x-2 transition-transform duration-300">
                {children}
            </span>
            <div className="absolute right-4 z-10 opacity-0 group-hover:opacity-100 text-secondary-foreground transition-all duration-300 group-hover:translate-x-0 -translate-x-2 scale-90 group-hover:scale-100">
                <ArrowRight className="h-5 w-5" />
            </div>
            <div className="absolute inset-0 z-0 bg-secondary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </motion.button>
    );
}
