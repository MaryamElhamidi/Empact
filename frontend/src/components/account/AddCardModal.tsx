"use client";

import { useState } from "react";
import { X, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export interface AddCardModalProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCardModal({ userId, onClose, onSuccess }: AddCardModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 16);
    return v.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (v.length === 1 && parseInt(v, 10) > 1) v = "0" + v;
    if (v.length === 2 && parseInt(v, 10) > 12) v = "12";
    setExpMonth(v);
  };

  const handleExpYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setExpYear(v);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
  };

  const rawCardNumber = cardNumber.replace(/\s/g, "");
  const lastFour = rawCardNumber.slice(-4);
  const isValid =
    lastFour.length === 4 &&
    expMonth.length === 2 &&
    parseInt(expMonth, 10) >= 1 &&
    parseInt(expMonth, 10) <= 12 &&
    expYear.length === 4 &&
    cvv.length >= 3 &&
    cardholderName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.addPaymentMethod(userId, {
        lastFour,
        expMonth: parseInt(expMonth, 10),
        expYear: parseInt(expYear, 10),
        cardholderName: cardholderName.trim(),
        billingZip: billingZip.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Add new card</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 rounded-lg p-3">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Card number</label>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="rounded-xl h-11"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Expiry month</label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp-month"
                placeholder="MM"
                value={expMonth}
                onChange={handleExpMonthChange}
                className="rounded-xl h-11"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Expiry year</label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp-year"
                placeholder="YYYY"
                value={expYear}
                onChange={handleExpYearChange}
                className="rounded-xl h-11"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvv}
              onChange={handleCvvChange}
              className="rounded-xl h-11 w-32"
              maxLength={4}
            />
            <p className="text-xs text-muted-foreground mt-1">For your security, CVV is not stored.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Cardholder name</label>
            <Input
              type="text"
              autoComplete="cc-name"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Billing ZIP / Postal code</label>
            <Input
              type="text"
              autoComplete="postal-code"
              placeholder="12345"
              value={billingZip}
              onChange={(e) => setBillingZip(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl h-11 font-bold" disabled={!isValid || submitting}>
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save card"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
