"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const GLOBE_CONFIG: COBEOptions = {
    width: 800,
    height: 800,
    onRender: () => { },
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [1, 1, 1],
    markerColor: [0.882, 0.110, 0.137], // 225/255, 28/255, 35/255 - CBS Red
    glowColor: [0.9, 0.9, 0.9],
    markers: [
        { location: [31.5, 34.46], size: 0.1 }, // Gaza
        { location: [23.68, 90.35], size: 0.1 }, // Bangladesh
        { location: [39.05, 34.8], size: 0.1 }, // Turkey
        { location: [11.5, 43.0], size: 0.1 }, // Sub-Saharan
        { location: [12.87, 121.77], size: 0.1 }, // Philippines
    ],
}

export function Globe({
    className,
    config = GLOBE_CONFIG,
}: {
    className?: string
    config?: COBEOptions
}) {
    let phi = 0
    let width = 0
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pointerInteracting = useRef<number | null>(null)
    const pointerInteractionMovement = useRef(0)
    const spinVelocity = useRef(0)
    const lastPointerData = useRef<{ x: number; t: number } | null>(null)
    const [r, setR] = useState(0)

    const updatePointerInteraction = (value: number | null) => {
        pointerInteracting.current = value
        if (canvasRef.current) {
            canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
        }
        if (value === null) {
            lastPointerData.current = null
        }
    }

    const updateMovement = (clientX: number) => {
        if (pointerInteracting.current !== null) {
            const now = performance.now()
            if (lastPointerData.current) {
                const dx = clientX - lastPointerData.current.x
                const dt = now - lastPointerData.current.t
                if (dt > 0) {
                    const velocity = dx / dt
                    spinVelocity.current = velocity * 0.02
                }
            }
            lastPointerData.current = { x: clientX, t: now }
            const delta = clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta
            setR(delta / 200)
        }
    }

    const onRender = useCallback(
        (state: Record<string, any>) => {
            if (pointerInteracting.current === null) {
                phi += 0.003 + spinVelocity.current
                spinVelocity.current *= 0.95
                if (Math.abs(spinVelocity.current) < 0.0001) {
                    spinVelocity.current = 0
                }
            }
            state.phi = phi + r
            state.width = width * 2
            state.height = width * 2
        },
        [r],
    )

    const onResize = () => {
        if (canvasRef.current) {
            width = canvasRef.current.offsetWidth
        }
    }

    useEffect(() => {
        window.addEventListener("resize", onResize)
        onResize()

        const globe = createGlobe(canvasRef.current!, {
            ...config,
            width: width * 2,
            height: width * 2,
            onRender,
        })

        setTimeout(() => {
            if (canvasRef.current) canvasRef.current.style.opacity = "1"
        })
        return () => globe.destroy()
    }, [])

    return (
        <div
            className={cn(
                "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
                className,
            )}
        >
            <canvas
                className={cn(
                    "size-full opacity-0 transition-opacity duration-1000 ease-in-out [contain:layout_paint_size]",
                )}
                ref={canvasRef}
                onPointerDown={(e) =>
                    updatePointerInteraction(
                        e.clientX - pointerInteractionMovement.current,
                    )
                }
                onPointerUp={() => updatePointerInteraction(null)}
                onPointerOut={() => updatePointerInteraction(null)}
                onMouseMove={(e) => updateMovement(e.clientX)}
                onTouchMove={(e) =>
                    e.touches[0] && updateMovement(e.touches[0].clientX)
                }
            />
        </div>
    )
}
