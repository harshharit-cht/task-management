// src/app/auth/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const password = watch("password", "");
  const passwordChecks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number",     pass: /\d/.test(password) },
    { label: "Contains a letter",     pass: /[a-zA-Z]/.test(password) },
  ];

  const onSubmit = async (data: SignupInput) => {
    setServerError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });

    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }

    // Auto login after signup
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Create your account</h2>
        <p className="text-slate-400">Start managing projects in minutes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{serverError}</p>
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Full name</label>
          <input {...register("name")} placeholder="Jane Doe"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Work email</label>
          <input {...register("email")} type="email" placeholder="you@company.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password strength indicators */}
          {password && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {passwordChecks.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                    c.pass ? "bg-emerald-500" : "bg-white/10"
                  }`}>
                    {c.pass && <Check size={8} strokeWidth={3} className="text-white" />}
                  </div>
                  <span className={`text-xs transition-colors ${c.pass ? "text-emerald-400" : "text-slate-600"}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Confirm password</label>
          <input {...register("confirmPassword")} type="password" placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
          {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 group mt-2">
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Creating account...</>
          ) : (
            <>Create account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>

        <p className="text-center text-slate-600 text-xs">
          By signing up you agree to our{" "}
          <span className="text-slate-500 underline cursor-pointer">Terms of Service</span>
          {" "}and{" "}
          <span className="text-slate-500 underline cursor-pointer">Privacy Policy</span>
        </p>
      </form>

      <p className="text-center text-slate-500 text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}