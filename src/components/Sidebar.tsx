"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Globe,
  Target,
  Play,
  FileSearch,
  Layers,
  FlaskConical,
  Terminal,
  BarChart3,
  User,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { clsx } from "clsx";

const navSections = [
  {
    label: "PRODUCT DEMO",
    items: [{ href: "/cases", label: "Cases", icon: Briefcase }],
  },
  {
    label: "AI ENGINEERING",
    items: [
      { href: "/landscape", label: "AI Landscape", icon: Globe },
      { href: "/strategy", label: "Agent Strategy", icon: Target },
      { href: "/demos", label: "Interactive Demos", icon: Play },
      { href: "/case-review", label: "Case Review", icon: FileSearch },
      { href: "/architecture", label: "Architecture", icon: Layers },
      { href: "/evals", label: "Evals", icon: FlaskConical },
      { href: "/ai-coding", label: "AI Coding", icon: Terminal },
    ],
  },
  {
    label: "MARKET",
    items: [
      { href: "/competitive", label: "Competitive + SEO", icon: BarChart3 },
      { href: "/about", label: "About", icon: User },
    ],
  },
  {
    label: "RESEARCH",
    items: [
      { href: "/problems", label: "AI Problem Patterns", icon: AlertTriangle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#0F1629] text-white shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-56 bg-[#0F1629] text-white flex flex-col min-h-screen",
          "transform transition-transform duration-200 ease-in-out",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link href="/" className="block p-4 border-b border-white/10 hover:bg-white/5 transition-colors">
          <h1 className="text-lg font-semibold tracking-tight">Deposly <span className="text-xs font-normal text-white/50">Lite</span></h1>
        </Link>
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
