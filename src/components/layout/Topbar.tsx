"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight, User } from "lucide-react";
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
                  ? "text-(--color-text-primary) font-medium"
                  : "hover:text-(--color-text-primary) transition-colors"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <Bell className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="User menu">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-primary-muted) ring-1 ring-(--color-primary)/30">
                <User className="h-3.5 w-3.5 text-(--color-primary)" />
              </div>
            </Button>
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
