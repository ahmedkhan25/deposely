"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Server } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/cases", label: "Cases", icon: Briefcase },
  { href: "/architecture", label: "Architecture", icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#0F1629] text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-tight">Deposly <span className="text-xs font-normal text-white/50">Lite</span></h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
