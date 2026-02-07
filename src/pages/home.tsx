import PublicLayout from "@/components/PublicLayout"

export default function Home() {
    return (
        <PublicLayout>
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
                {/* Welcome Card */}
                <div className="w-full bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Welcome to ServerMon</h1>
                    <p className="text-muted-foreground text-base mb-4 max-w-lg">
                        Monitor your server's health, performance, and activity in real-time. Explore detailed metrics for CPU, memory, disk, and network usage, all in a beautiful and intuitive dashboard.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        <div className="flex flex-col items-center bg-background/80 border border-border rounded-xl px-6 py-4 shadow-md">
                            <span className="text-blue-500 mb-1">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M17 10.5V6.75A2.25 2.25 0 0 0 14.75 4.5h-5.5A2.25 2.25 0 0 0 7 6.75v3.75m10 0v6.75A2.25 2.25 0 0 1 14.75 19.5h-5.5A2.25 2.25 0 0 1 7 17.25V10.5m10 0H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <span className="font-semibold">Dashboard</span>
                            <span className="text-xs text-muted-foreground">Overview & stats</span>
                        </div>
                        <div className="flex flex-col items-center bg-background/80 border border-border rounded-xl px-6 py-4 shadow-md">
                            <span className="text-green-500 mb-1">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 20v-6m0 0l-3 3m3-3l3 3M4 6h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <span className="font-semibold">Monitoring</span>
                            <span className="text-xs text-muted-foreground">Live metrics</span>
                        </div>
                        <div className="flex flex-col items-center bg-background/80 border border-border rounded-xl px-6 py-4 shadow-md">
                            <span className="text-violet-500 mb-1">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M8 17v-2a4 4 0 0 1 8 0v2m-8 0h8m-8 0a2 2 0 0 1-2-2v-2a6 6 0 0 1 12 0v2a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <span className="font-semibold">Server Info</span>
                            <span className="text-xs text-muted-foreground">Specs & details</span>
                        </div>
                        <div className="flex flex-col items-center bg-background/80 border border-border rounded-xl px-6 py-4 shadow-md">
                            <span className="text-orange-500 mb-1">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M4 17v-2a4 4 0 0 1 8 0v2m-8 0h8m-8 0a2 2 0 0 1-2-2v-2a6 6 0 0 1 12 0v2a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <span className="font-semibold">Terminal</span>
                            <span className="text-xs text-muted-foreground">Remote shell</span>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
                    <a href="/dashboard" className="flex-1 bg-primary text-white rounded-xl px-6 py-4 text-center font-semibold shadow-lg hover:bg-primary/90 transition-all">Go to Dashboard</a>
                    <a href="/monitoring" className="flex-1 bg-accent text-primary rounded-xl px-6 py-4 text-center font-semibold shadow-lg hover:bg-accent/80 transition-all">Live Monitoring</a>
                </div>
            </div>
        </PublicLayout>
    );
}