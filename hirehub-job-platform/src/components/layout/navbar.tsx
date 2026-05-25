import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Jobs", href: "#" },
  { label: "Companies", href: "#" },
  { label: "Applications", href: "#" },
  { label: "Pricing", href: "#" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/hirehub-logo-light.svg"
            alt="HireHub"
            width={148}
            height={36}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button>Post a job</Button>
        </div>
      </div>
    </header>
  );
}
