"use client";

import { useState } from "react";
import { ShieldCheck, Inbox, Users, BookOpen, FolderPlus } from "lucide-react";
import ModerationQueue from "@/components/ModerationQueue";
import ManageUsers from "@/components/ManageUsers";
import AddCourseForm from "@/components/AddCourseForm";
import AddFolderForm from "@/components/AddFolderForm";

const TABS = [
  { id: "queue", label: "Moderation", icon: Inbox },
  { id: "users", label: "Users", icon: Users },
  { id: "courses", label: "Add course", icon: BookOpen },
  { id: "folders", label: "Add folder", icon: FolderPlus },
];

export default function AdminPage() {
  const [tab, setTab] = useState("queue");

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={20} strokeWidth={1.75} className="text-accent" />
          <h1 className="text-2xl font-medium text-text">Admin</h1>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border mb-6 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm transition-colors ${
                tab === id ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        {tab === "queue" && <ModerationQueue />}
        {tab === "users" && <ManageUsers />}
        {tab === "courses" && <AddCourseForm />}
        {tab === "folders" && <AddFolderForm />}
      </div>
    </div>
  );
}