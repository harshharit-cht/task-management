import Image from "next/image";
import { Zap, ShieldCheck, PieChart, CheckCircle2 } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";


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
                <BackgroundPaths />
                {/* Animated orbs */}
                {/* <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
                />
                <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }}
                /> */}

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
                    <div className="flex flex-col gap-4 mt-10">
                        {[
                            {
                                icon: <Zap size={16} className="text-amber-400 fill-amber-400/10" />,
                                text: "Real-time task tracking",
                                desc: "Instant sync across all devices"
                            },
                            {
                                icon: <ShieldCheck size={16} className="text-emerald-400 fill-emerald-400/10" />,
                                text: "Enterprise-grade security",
                                desc: "Role-based access & encryption"
                            },
                            {
                                icon: <PieChart size={16} className="text-indigo-400 fill-indigo-400/10" />,
                                text: "Advanced data analytics",
                                desc: "Visualize team velocity & bottlenecks"
                            },
                        ].map((f) => (
                            <div key={f.text} className="group flex items-center gap-4">
                                {/* Icon Container with subtle glow */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform group-hover:-translate-y-0.5">
                                        {f.icon}
                                    </div>
                                </div>

                                {/* Text Stack */}
                                <div className="flex flex-col">
                                    <span className="text-slate-200 text-sm font-semibold tracking-tight transition-colors group-hover:text-white">
                                        {f.text}
                                    </span>
                                    <span className="text-slate-500 text-[11px] font-medium leading-none mt-1">
                                        {f.desc}
                                    </span>
                                </div>
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