"use client";

import { useState, useEffect } from "react";
import { Users, LoaderCircle } from "lucide-react";

const ROLES = ["member", "moderator", "admin"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id, role) {
    setUpdating(id);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        <LoaderCircle size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <Users size={16} strokeWidth={1.75} className="text-accent" />
        <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
          {users.length} users
        </p>
      </div>

      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>

          <select
            value={user.role}
            disabled={updating === user._id}
            onChange={(e) => handleRoleChange(user._id, e.target.value)}
            className="rounded-md border border-border bg-surface-2 py-1.5 px-2 text-sm text-text outline-none focus:border-accent disabled:opacity-60"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}