"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LibraryBig, ShieldCheck, LogIn, LogOut, LoaderCircle } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  }

  const role = session?.user?.role;

  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 md:px-10 h-14 flex items-center justify-between">
        <Link href="/courses" className="flex items-center gap-2 text-text">
          <LibraryBig size={18} strokeWidth={1.75} className="text-accent" />
          <span className="font-medium text-sm">UBIT Study Hub</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/courses"
            className={`text-sm transition-colors ${
              pathname.startsWith("/courses") ? "text-accent" : "text-text-muted hover:text-text"
            }`}
          >
            Courses
          </Link>

          {(role === "admin" || role === "moderator") && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                pathname.startsWith("/admin") ? "text-accent" : "text-text-muted hover:text-text"
              }`}
            >
              <ShieldCheck size={14} strokeWidth={1.75} />
              Admin
            </Link>
          )}

        {isPending ? (
          <LoaderCircle size={16} className="animate-spin text-text-muted" />
        ) : session ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-error transition-colors"
          >
            <LogOut size={14} strokeWidth={1.75} />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg hover:bg-accent-hover transition-colors"
          >
            <LogIn size={14} strokeWidth={1.75} />
            Login
          </Link>
        )}
        </div>
      </div>
    </nav>
  );
}