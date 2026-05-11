// src/app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-400">Sign in to your workspace</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{serverError}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@company.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
          {errors.email && (
            <p className="text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <Link href="/auth/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pr-12"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 group">
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
          ) : (
            <>Sign in <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0a0a0f] px-3 text-slate-500">Quick access</span>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Demo Accounts</p>
        {[
          { email: "arjun@example.com", role: "Admin" },
          { email: "priya@example.com",   role: "Admin" },
          { email: "rohan@example.com", role: "Member" },
        ].map((acc) => (
          <div key={acc.email} className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono">{acc.email}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              acc.role === "Admin"
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-slate-500/20 text-slate-400"
            }`}>{acc.role}</span>
          </div>
        ))}
        <p className="text-slate-600 text-xs pt-1">Password: <span className="font-mono text-slate-500">password123</span></p>
      </div>

      {/* Sign up link */}
      <p className="text-center text-slate-500 text-sm">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}