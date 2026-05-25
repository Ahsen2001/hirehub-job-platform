"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  label: string;
  href: string;
  marker: string;
};

type DashboardShellProps = {
  user: SessionUser;
  roleLabel: string;
  navItems: DashboardNavItem[];
  children: ReactNode;
};

export function DashboardShell({
  user,
  roleLabel,
  navItems,
  children,
}: DashboardShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden">
        <DashboardTopbar
          user={user}
          roleLabel={roleLabel}
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen((current) => !current)}
        />
        {isMenuOpen ? (
          <div className="border-b border-border bg-white px-4 py-3 shadow-card">
            <DashboardNav
              navItems={navItems}
              pathname={pathname}
              onNavigate={() => setIsMenuOpen(false)}
            />
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-white p-4 lg:block">
          <DashboardBrand />
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <Badge variant="primary">{roleLabel}</Badge>
            <p className="mt-3 text-sm font-semibold text-dark">{user.name}</p>
            <p className="mt-1 truncate text-xs text-muted">{user.email}</p>
          </div>
          <DashboardNav
            className="mt-6"
            navItems={navItems}
            pathname={pathname}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="hidden lg:block">
            <DashboardTopbar user={user} roleLabel={roleLabel} />
          </div>
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function DashboardBrand() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/hirehub-logo-dark.svg"
        alt="HireHub"
        width={148}
        height={36}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}

function DashboardTopbar({
  user,
  roleLabel,
  isMenuOpen = false,
  onMenuToggle,
}: {
  user: SessionUser;
  roleLabel: string;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuToggle ? (
            <button
              type="button"
              onClick={onMenuToggle}
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-white text-sm font-bold text-dark shadow-sm transition-colors hover:border-primary hover:text-primary lg:hidden"
              aria-label="Toggle dashboard menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "X" : "M"}
            </button>
          ) : null}
          <div className="lg:hidden">
            <DashboardBrand />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="text-xs font-semibold uppercase text-muted">
              {roleLabel} workspace
            </p>
            <p className="truncate text-sm font-semibold text-dark">
              Welcome back, {user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary">{roleLabel}</Badge>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function DashboardNav({
  navItems,
  pathname,
  className,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className={cn("grid gap-1", className)} aria-label="Dashboard">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              isActive
                ? "bg-blue-50 text-primary"
                : "text-slate-600 hover:bg-slate-50 hover:text-dark",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs font-bold",
                isActive
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {item.marker}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 rounded-card border border-border bg-white p-5 shadow-card sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-dark sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function DashboardMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-muted">{label}</p>
      </CardContent>
    </Card>
  );
}
