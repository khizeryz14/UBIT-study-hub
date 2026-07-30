"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, LoaderCircle, Search, X } from "lucide-react";

const ROLES = ["member", "moderator", "admin"];
const PAGE_SIZE = 20;

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (activeSearch) params.set("q", activeSearch);
    if (roleFilter) params.set("role", roleFilter);

    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setUsers(Array.isArray(data.users) ? data.users : []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, activeSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
  }

  function handleRoleFilterChange(role) {
    setRoleFilter(role);
    setPage(1);
  }

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-md border border-border bg-surface-2 py-2 pl-9 pr-9 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilterChange(e.target.value)}
          className="rounded-md border border-border bg-surface-2 py-2 px-3 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </form>

      <div className="flex items-center gap-2">
        <Users size={16} strokeWidth={1.75} className="text-accent" />
        <p className="font-mono text-[11px] tracking-wide text-text-muted uppercase">
          {total} user{total !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-muted">
          <LoaderCircle size={20} className="animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">No users match this search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
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
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-text-muted">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-text-muted hover:text-text disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}