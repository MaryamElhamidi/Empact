import { ImpactDashboard } from "@/components/account/ImpactDashboard";
import { WalletCard } from "@/components/account/WalletCard";
import { LogOut, User, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Account() {
    const history = [
        { id: 1, charity: "Global Medical Response", amount: 50, date: "Oct 24, 2026", receipt: "#" },
        { id: 2, charity: "Climate Action Network", amount: 25, date: "Sep 12, 2026", receipt: "#" },
        { id: 3, charity: "Disaster Relief Asia", amount: 100, date: "Jul 05, 2026", receipt: "#" },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-muted/20 pb-24">
            <div className="bg-primary text-primary-foreground pt-16 pb-28 md:pb-36 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent opacity-90 mix-blend-multiply" />
                <div className="absolute right-0 top-0 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-2xl backdrop-blur-md">
                        <User className="w-16 h-16 md:w-20 md:h-20 opacity-80" />
                    </div>
                    <div className="md:mt-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-3 tracking-tight">Elena Rostova</h1>
                        <p className="text-primary-foreground/70 font-medium text-lg flex items-center justify-center md:justify-start gap-2 bg-black/20 px-4 py-2 rounded-full w-fit mx-auto md:mx-0">
                            <Mail className="w-4 h-4" /> elena.r@example.com
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-16 relative z-20">
                <div className="bg-card rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-border">
                    <ImpactDashboard />
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-8 flex flex-col gap-12">
                    <section>
                        <h3 className="text-3xl font-bold font-sans mb-8">Donation History</h3>
                        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                            {history.map((record, i) => (
                                <div key={record.id} className={`p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-muted/30 transition-colors ${i !== history.length - 1 ? 'border-b border-border/80' : ''}`}>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">{record.charity}</h4>
                                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{record.date}</p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                                        <span className="text-3xl font-bold font-sans">${record.amount}</span>
                                        <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-bold px-6 h-12 shadow-sm">
                                            Receipt
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-3xl font-bold font-sans mb-8">Account Settings</h3>
                        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-8 md:p-10 flex flex-col gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-xl mb-1">Notification Preferences</h4>
                                    <p className="text-sm text-muted-foreground font-medium">Manage email and push alerts.</p>
                                </div>
                                <Button variant="outline" className="rounded-xl font-bold px-6 h-12">Manage</Button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-8">
                                <div>
                                    <h4 className="font-bold text-xl mb-1">Two-Factor Authentication</h4>
                                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-secondary" /> Not enabled</p>
                                </div>
                                <Button variant="outline" className="rounded-xl border-secondary text-secondary hover:bg-secondary/10 font-bold px-6 h-12">Enable</Button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <WalletCard />

                    <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-16 rounded-[2rem] font-bold text-lg mt-4 border border-transparent hover:border-destructive/20 transition-all">
                        <LogOut className="w-5 h-5 mr-3" /> Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
