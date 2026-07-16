"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, LoaderCircle } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import AuthShell from "@/components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    await signUp.email(
      { name, email, password },
      {
        onSuccess: () => router.push("/courses"),
        onError: (ctx) => {
          setError(ctx.error.message || "Could not create account.");
          setLoading(false);
        },
      }
    );
  }

  return (
    <AuthShell eyebrow="New Member" title="Create your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
            Full name
          </span>
          <div className="relative">
            <User
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="Your name"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
            Email
          </span>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="you@ubit.edu"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
            Password
          </span>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 py-2.5 pl-9 pr-9 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.75} />
              ) : (
                <Eye size={16} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} strokeWidth={1.75} />
          )}
          Create account
        </button>

        <p className="text-center text-sm text-text-muted mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}