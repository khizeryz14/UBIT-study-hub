"use client";

import { useState } from "react";
import { ShieldCheck, Inbox, Users, BookOpen, FolderPlus, Pencil } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import ModerationQueue from "@/components/ModerationQueue";
import ManageUsers from "@/components/ManageUsers";
import AddCourseForm from "@/components/AddCourseForm";
import AddFolderForm from "@/components/AddFolderForm";
import ManageCourses from "@/components/ManageCourses";

const ALL_TABS = [
  { id: "queue", label: "Moderation", icon: Inbox, roles: ["admin", "moderator"] },
  { id: "courses", label: "Add course", icon: BookOpen, roles: ["admin", "moderator"] },
  { id: "folders", label: "Add folder", icon: FolderPlus, roles: ["admin", "moderator"] },
  { id: "manageCourses", label: "Edit courses", icon: Pencil, roles: ["admin"] },
  { id: "users", label: "Users", icon: Users, roles: ["admin"] },
];

export default function AdminPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleTabs = ALL_TABS.filter((t) => t.roles.includes(role));
  const [tab, setTab] = useState(null);

  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : visibleTabs[0]?.id;

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={20} strokeWidth={1.75} className="text-accent" />
          <h1 className="text-2xl font-medium text-text">Admin</h1>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border mb-6 -mb-px">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm transition-colors ${
                activeTab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "queue" && <ModerationQueue />}
        {activeTab === "courses" && <AddCourseForm />}
        {activeTab === "folders" && <AddFolderForm />}
        {activeTab === "manageCourses" && <ManageCourses />}
        {activeTab === "users" && <ManageUsers />}
      </div>
    </div>
  );
}