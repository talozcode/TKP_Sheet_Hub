"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Archive, ArrowUpRight, Moon, Sun, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";

export function Header() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-primary/20 bg-gradient-to-br from-emerald-500/15 via-teal-400/10 to-cyan-400/10 transition-transform group-hover:scale-105">
            <Image
              src={BRAND.logoUrl}
              alt={BRAND.name}
              fill
              sizes="36px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight">{BRAND.name}</span>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              {BRAND.tagline}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 text-primary"
          >
            <a href={BRAND.masterSheetUrl} target="_blank" rel="noreferrer">
              <FileSpreadsheet />
              <span className="hidden sm:inline">Master Sheet</span>
              <ArrowUpRight className="!h-3.5 !w-3.5 opacity-70" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-9">
            <Link href="/archived">
              <Archive />
              <span className="hidden sm:inline">Archived</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
      {/* Subtle teal underline gradient */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
