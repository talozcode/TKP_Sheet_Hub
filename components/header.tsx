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
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src={BRAND.logoUrl}
            alt={BRAND.name}
            width={50}
            height={50}
            sizes="50px"
            className="h-[50px] w-[50px] object-contain"
            priority
          />
          <span className="font-semibold tracking-tight text-base">
            {BRAND.name}
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live · Google Sheets
          </span>
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
