import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export type NotificationType = "success" | "alert" | "info" | "error";

interface NotificationItemProps {
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead?: boolean;
}

export function NotificationItem({ type, title, message, timestamp, isRead = false }: NotificationItemProps) {
    const getIcon = () => {
        switch (type) {
            case "success": return <CheckCircle2 className="h-6 w-6 text-accent" />;
            case "alert": return <AlertCircle className="h-6 w-6 text-secondary" />;
            case "error": return <XCircle className="h-6 w-6 text-destructive" />;
            case "info": default: return <Info className="h-6 w-6 text-primary" />;
        }
    };

    return (
        <div className={cn(
            "p-5 rounded-2xl flex gap-4 transition-all duration-300 border hover:shadow-md cursor-pointer",
            isRead ? "bg-card border-border/50 opacity-75 grayscale-[20%]" : "bg-primary/5 border-primary/20 shadow-sm"
        )}>
            <div className="mt-0.5 shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-border/50">
                {getIcon()}
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-1 gap-4">
                    <h4 className={cn("font-bold font-sans text-lg", !isRead && "text-primary")}>{title}</h4>
                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded-md">{timestamp}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">{message}</p>
            </div>
            {!isRead && (
                <div className="shrink-0 flex items-center justify-center pl-2">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(225,28,35,0.6)]" />
                </div>
            )}
        </div>
    );
}
