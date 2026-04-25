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
    <header className="sticky top-0 z-30 border-b border-border/80 glass">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative h-8 w-8 overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
            <Image
              src={BRAND.logoUrl}
              alt={BRAND.name}
              fill
              sizes="32px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <span className="font-semibold tracking-tight text-[15px]">
            {BRAND.name}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <a href={BRAND.masterSheetUrl} target="_blank" rel="noreferrer">
              <FileSpreadsheet />
              <span className="hidden sm:inline">Master Sheet</span>
              <ArrowUpRight className="!h-3 !w-3 opacity-60" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Link href="/archived">
              <Archive />
              <span className="hidden sm:inline">Archived</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
