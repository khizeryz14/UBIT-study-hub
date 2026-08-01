"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LibraryBig, ShieldCheck, LogIn, LogOut, LoaderCircle,
  UserCircle, BookOpen, Menu, X,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically whenever the route changes —
  // otherwise it stays open after navigating, which feels broken.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  }

  const role = session?.user?.role;

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 text-sm transition-colors ${
      pathname.startsWith(path) ? "text-accent" : "text-text-muted hover:text-text"
    }`;

  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 md:px-10 h-14 flex items-center justify-between">
        <Link href="/courses" className="flex items-center gap-2 text-text">
          <LibraryBig size={18} strokeWidth={1.75} className="text-accent" />
          <span className="font-medium text-sm">UBIT Study Hub</span>
        </Link>

        {/* Desktop nav — unchanged, hidden below md */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/courses" className={navLinkClass("/courses")}>
            <BookOpen size={14} strokeWidth={1.75} />
            Courses
          </Link>

          {session && (
            <Link href="/profile" className={navLinkClass("/profile")}>
              <UserCircle size={14} strokeWidth={1.75} />
              Profile
            </Link>
          )}

          {(role === "admin" || role === "moderator") && (
            <Link href="/admin" className={navLinkClass("/admin")}>
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

        {/* Mobile hamburger — hidden at md and up */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden text-text-muted hover:text-text transition-colors"
        >
          {menuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-3">
          <Link href="/courses" className={navLinkClass("/courses")}>
            <BookOpen size={16} strokeWidth={1.75} />
            Courses
          </Link>

          {session && (
            <Link href="/profile" className={navLinkClass("/profile")}>
              <UserCircle size={16} strokeWidth={1.75} />
              Profile
            </Link>
          )}

          {(role === "admin" || role === "moderator") && (
            <Link href="/admin" className={navLinkClass("/admin")}>
              <ShieldCheck size={16} strokeWidth={1.75} />
              Admin
            </Link>
          )}

          <div className="border-t border-border pt-3">
            {isPending ? (
              <LoaderCircle size={16} className="animate-spin text-text-muted" />
            ) : session ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-error transition-colors"
              >
                <LogOut size={16} strokeWidth={1.75} />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg hover:bg-accent-hover transition-colors w-fit"
              >
                <LogIn size={16} strokeWidth={1.75} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}