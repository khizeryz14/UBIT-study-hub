"use client";

import { useState } from "react";
import { UserCircle, FileStack, GraduationCap } from "lucide-react";
import MyResources from "@/components/MyResources";
import GradesTracker from "@/components/GradesTracker";

const TABS = [
  { id: "resources", label: "My Resources", icon: FileStack },
  { id: "grades", label: "My Grades", icon: GraduationCap },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("resources");

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <UserCircle size={20} strokeWidth={1.75} className="text-accent" />
          <h1 className="text-2xl font-medium text-text">My Profile</h1>
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

        {tab === "resources" && <MyResources />}
        {tab === "grades" && <GradesTracker />}
      </div>
    </div>
  );
}