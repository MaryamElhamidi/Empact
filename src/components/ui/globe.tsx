"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Globe({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        if (!canvasRef.current) return;

        // Convert hex to rgb format (0-1)
        // White: #FFFFFF -> 1, 1, 1
        // Red: #E11C23 -> 225/255, 28/255, 35/255 -> 0.882, 0.110, 0.137
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 1000 * 2,
            height: 1000 * 2,
            phi: 0,
            theta: 0.25,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [1, 1, 1],
            markerColor: [0.882, 0.110, 0.137],
            glowColor: [0.9, 0.9, 0.9], // soft bright glow
            markers: [
                { location: [31.5, 34.46], size: 0.1 }, // Gaza
                { location: [23.68, 90.35], size: 0.1 }, // Bangladesh
                { location: [39.05, 34.8], size: 0.1 }, // Turkey
                { location: [11.5, 43.0], size: 0.1 }, // Sub-Saharan
                { location: [12.87, 121.77], size: 0.1 }, // Philippines
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.003;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div className={cn("relative flex items-center justify-center w-full max-w-[1000px] aspect-square", className)}>
            <canvas
                ref={canvasRef}
                className="w-full h-full transition-opacity duration-1000 ease-in-out"
                style={{ width: "100%", height: "100%", contain: "layout paint size" }}
            />
        </div>
    );
}
