"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DonationButtonGroupProps {
    onAmountSelect?: (amount: number) => void;
}

export function DonationButtonGroup({ onAmountSelect }: DonationButtonGroupProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");

    const amounts = [10, 25, 50];

    const handleSelect = (amount: number) => {
        setSelected(amount);
        setCustomAmount("");
        onAmountSelect?.(amount);
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomAmount(val);
        if (val && !isNaN(Number(val))) {
            setSelected(Number(val));
            onAmountSelect?.(Number(val));
        } else {
            setSelected(0);
        }
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {amounts.map((amount) => (
                <Button
                    key={amount}
                    variant={selected === amount && !customAmount ? "default" : "outline"}
                    className={cn(
                        "h-14 text-lg font-bold rounded-xl transition-all duration-300",
                        selected === amount && !customAmount
                            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                            : "bg-background text-foreground hover:bg-muted"
                    )}
                    onClick={() => handleSelect(amount)}
                >
                    ${amount}
                </Button>
            ))}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    $
                </span>
                <Input
                    type="number"
                    placeholder="Custom"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className={cn(
                        "h-14 pl-8 rounded-xl text-lg font-bold border-input focus-visible:ring-primary transition-all duration-300",
                        customAmount ? "ring-2 ring-primary ring-offset-2 border-primary" : ""
                    )}
                />
            </div>
        </div>
    );
}
