import { CreditCard, Plus, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
export function WalletCard() {
    return (
        <Card className="rounded-[2rem] border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
                <p className="text-primary-foreground/80 text-sm font-semibold tracking-wide uppercase mb-2 relative z-10">Available Balance</p>
                <h3 className="text-5xl font-sans font-bold relative z-10">$240.00</h3>
            </div>
            <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-white rounded-xl h-14 font-bold text-base shadow-sm">
                        <Plus className="mr-2 w-5 h-5" /> Add Funds
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl h-14 font-bold text-base border-border/80 hover:bg-muted/50">
                        <Settings2 className="mr-2 w-5 h-5 text-primary" /> Auto-Donate
                    </Button>
                </div>

                <Separator className="my-8 opacity-50" />

                <div className="space-y-5">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Methods</p>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-border/50">
                                <CreditCard className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-base text-foreground">•••• 4242</p>
                                <p className="text-xs text-muted-foreground font-medium">Expires 12/28</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">Remove</Button>
                    </div>

                    <Button variant="ghost" className="w-full border-2 border-dashed border-border/80 h-16 rounded-2xl text-primary font-bold hover:bg-primary/5 hover:border-primary/40 transition-all">
                        <Plus className="mr-2 w-5 h-5" /> Add New Card
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
