"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [5, 10, 15, 20] as const;
const OTHER = "other";

export interface DonateAmountModalProps {
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function DonateAmountModal({ onClose, onConfirm }: DonateAmountModalProps) {
  const [selected, setSelected] = useState<number | typeof OTHER>(5);
  const [customAmount, setCustomAmount] = useState("");

  const displayAmount =
    selected === OTHER
      ? (() => {
          const n = parseFloat(customAmount.replace(/[^0-9.]/g, ""));
          return Number.isFinite(n) && n >= 0 ? n : 0;
        })()
      : selected;

  const isValid = selected !== OTHER ? true : displayAmount > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(displayAmount);
    onClose();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <h3 className="text-lg font-bold text-foreground">Choose amount</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Connected preset tabs: $5 | $10 | $15 | $20 | Other */}
          <div className="flex rounded-xl border border-border overflow-hidden bg-muted/30">
            {PRESETS.map((value, index) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-r border-border ${
                  selected === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                } ${index === 0 ? "rounded-l-xl" : ""}`}
              >
                ${value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelected(OTHER)}
              className={`flex-1 py-3 text-sm font-bold transition-colors rounded-r-xl ${
                selected === OTHER
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              Other
            </button>
          </div>

          {/* Custom amount input when Other is selected */}
          {selected === OTHER && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Enter amount ($)</label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={customAmount}
                onChange={handleCustomChange}
                className="rounded-xl h-11 text-base"
                autoFocus
              />
            </div>
          )}

          <Button
            className="w-full h-12 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Donate ${selected === OTHER ? displayAmount.toFixed(displayAmount % 1 === 0 ? 0 : 2) : displayAmount}
          </Button>
        </div>
      </div>
    </div>
  );
}
