"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileBarChart, Blocks, MessageSquare, Plus, Settings, HelpCircle, Route, MessageCircle, BarChart3, LineChart } from "lucide-react";

export default function InsightsSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/insights/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/insights/analytics", label: "Analytics", icon: LineChart },
    { href: "/insights/tasks", label: "Tasks", icon: Route },
    { href: "/insights/feed", label: "Feed", icon: MessageCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 p-6 border-r border-[#dbe4d5] sticky top-0 shrink-0" style={{ backgroundColor: 'transparent' }}>
      <div className="mb-8 px-2 flex flex-col pt-2">
        <h2 className="text-xl tracking-tight font-extrabold" style={{ color: '#0f766e' }}>
          Project Alpha
        </h2>
        <p className="text-[11px] uppercase tracking-widest text-[#5d6d62] opacity-80 mt-1">
          Enterprise Flow
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href);
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-[14px] ${
                isActive 
                  ? "bg-[#eef2e7] text-[#0f766e] font-bold" 
                  : "text-[#5d6d62] hover:text-[#115e59] hover:bg-[#eef2e7]/50"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 pt-8 mt-auto">
        <button className="text-[13px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 transition-all text-white font-semibold" style={{ backgroundColor: '#0f766e' }}>
          <Plus size={18} strokeWidth={3} />
          New Insight
        </button>

        <div className="flex flex-col border-t border-[#dbe4d5] pt-4 mt-2">
          <Link className="flex items-center gap-3 px-4 py-2.5 text-[#5d6d62] hover:text-[#0f766e] transition-colors rounded-xl hover:bg-[#eef2e7]/30" href="#">
            <Settings size={18} />
            <span className="text-[13px] font-medium">Settings</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-2.5 text-[#5d6d62] hover:text-[#0f766e] transition-colors rounded-xl hover:bg-[#eef2e7]/30" href="#">
            <HelpCircle size={18} />
            <span className="text-[13px] font-medium">Support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}