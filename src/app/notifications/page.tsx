import { NotificationItem, NotificationType } from "@/components/notifications/NotificationItem";

export default function Notifications() {
    const notifications = [
        {
            id: "1",
            type: "alert" as NotificationType,
            title: "New Crisis Alert: Earthquake in Turkey",
            message: "A 7.2 magnitude earthquake has struck central Turkey. Emergency teams are being deployed. Your support could make an immediate difference.",
            timestamp: "10 min ago",
            isRead: false,
        },
        {
            id: "2",
            type: "success" as NotificationType,
            title: "Donation Delivered: Gaza Medical Aid",
            message: "Your $50 donation has successfully reached the ground teams and is providing medical fuel for Al-Shifa hospital.",
            timestamp: "2 hours ago",
            isRead: false,
        },
        {
            id: "3",
            type: "info" as NotificationType,
            title: "Impact Update: 3 Months Later",
            message: "The community well you helped fund in Kenya is now providing clean water to 400 people daily. Tap to read the full report.",
            timestamp: "1 day ago",
            isRead: true,
        },
        {
            id: "4",
            type: "error" as NotificationType,
            title: "Action Required: Payment Failed",
            message: "Your recurring $10 donation for the Climate Relief Fund could not be processed. Please update your payment method.",
            timestamp: "3 days ago",
            isRead: true,
        }
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-muted/20 pb-20">
            <div className="container mx-auto px-4 lg:px-8 pt-12 md:pt-16 max-w-4xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/60">
                    <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight">Notifications</h1>
                    <button className="text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 px-5 py-2.5 rounded-full transition-colors border border-primary/20 shadow-sm">
                        Mark all read
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {notifications.map((notif) => (
                        <NotificationItem
                            key={notif.id}
                            type={notif.type}
                            title={notif.title}
                            message={notif.message}
                            timestamp={notif.timestamp}
                            isRead={notif.isRead}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
