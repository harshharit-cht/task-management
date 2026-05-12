import Image from "next/image";

// src/app/auth/layout.tsx
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
                style={{
                    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
                }}
            >
                {/* Animated orbs */}
                <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
                />
                <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }}
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden shadow-lg">
                        <Image
                            src="/images/logo.png"
                            alt="Ethara Flow Logo"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xl font-semibold tracking-tight text-white">
                            Ethara Flow
                        </span>

                        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                            Team Workspace
                        </span>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                            Ship faster,<br />
                            <span className="text-indigo-400">together.</span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                            The workspace where high-performing teams manage projects, track tasks, and hit deadlines.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: "⚡", text: "Real-time task tracking" },
                            { icon: "🔐", text: "Role-based access control" },
                            { icon: "📊", text: "Progress dashboards" },
                        ].map((f) => (
                            <div key={f.text} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                    {f.icon}
                                </div>
                                <span className="text-slate-300 text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <div className="relative z-10 border-l-2 border-indigo-500/50 pl-4">
                    <p className="text-slate-400 text-sm italic">
                        "Ethara Flow cut our project delivery time by 40%."
                    </p>
                    <p className="text-slate-500 text-xs mt-1">— Engineering Lead, Series B Startup</p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}