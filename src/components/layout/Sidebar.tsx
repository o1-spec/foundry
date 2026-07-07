"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Plus,
  Zap,
  Settings,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/missions/new", label: "New Mission", icon: Plus, highlight: true },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-(--color-border-subtle) bg-(--color-bg-surface)">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-(--color-border-subtle) px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary) shadow-sm shadow-(--color-primary)/40">
          <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-(--color-text-primary)">
          Foundry
        </span>
        <span className="ml-auto rounded-md bg-(--color-primary-muted) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-(--color-primary)">
          Beta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                active
                  ? "bg-(--color-primary-muted) text-(--color-primary-hover)"
                  : highlight
                  ? "border border-dashed border-(--color-border-default) text-(--color-text-muted) hover:border-(--color-primary)/40 hover:text-(--color-text-primary)"
                  : "text-(--color-text-muted) hover:bg-(--color-bg-elevated) hover:text-(--color-text-primary)"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  active ? "text-(--color-primary)" : "text-current"
                )}
              />
              {label}
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 border-t border-(--color-border-subtle) p-2">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-(--color-text-muted) transition-all hover:bg-(--color-bg-elevated) hover:text-(--color-text-primary)"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}

        {/* Status indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-(--color-border-subtle) px-3 py-2 mt-1">
          <Activity className="h-3 w-3 text-(--color-success)" />
          <span className="text-[10px] text-(--color-text-muted)">Runtime online</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-(--color-success)" />
        </div>
      </div>
    </aside>
  );
}
