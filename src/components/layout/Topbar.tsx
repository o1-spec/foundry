"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: path });
  }
  return crumbs;
}

export function Topbar() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-(--color-border-subtle) bg-(--color-bg-surface) px-4">
      {/* Breadcrumbs */}
      <nav className="flex flex-1 items-center gap-1 text-xs text-(--color-text-muted)" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
            <span
              className={
                i === crumbs.length - 1
                  ? "text-(--color-text-primary) font-semibold"
                  : "hover:text-(--color-text-primary) transition-colors"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link href="/missions/new">
          <Button size="sm" className="bg-(--color-primary) text-white hover:bg-(--color-primary-hover) rounded-full text-xs font-semibold px-4 shadow-sm shadow-neutral-900/5">
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.5} /> New Mission
          </Button>
        </Link>

        <button aria-label="Notifications" className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-xs">
          <Bell className="h-3.5 w-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="User menu" className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200/50 hover:opacity-90 transition-opacity">
              <User className="h-3.5 w-3.5 text-(--color-primary)" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-(--color-error)">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
