"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Globe,
  Pencil,
  Archive,
  Star,
  StickyNote,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SheetItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SheetCardProps {
  sheet: SheetItem;
  onEdit?: (sheet: SheetItem) => void;
  onArchive?: (sheet: SheetItem) => void;
  onRestore?: (sheet: SheetItem) => void;
  archived?: boolean;
  busy?: boolean;
}

export function SheetCard({
  sheet,
  onEdit,
  onArchive,
  onRestore,
  archived,
  busy,
}: SheetCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="group relative"
    >
      <div className="card-sheen relative overflow-hidden rounded-xl border border-border/70 bg-card p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card-hover">
        <div className="flex items-start gap-3">
          {/* Icon tile */}
          <div className="gradient-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary ring-1 ring-primary/15">
            <SheetGlyph />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground">
                {sheet.name || "Untitled sheet"}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {sheet.favorite && (
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                )}
                {sheet.notes && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <StickyNote className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="max-w-xs whitespace-pre-line"
                    >
                      {sheet.notes}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <StatusPill status={sheet.status} />
              {sheet.web_app_url && (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Globe className="h-2.5 w-2.5" />
                  web app
                </span>
              )}
              {sheet.categories.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px]"
                >
                  {c}
                </span>
              ))}
              {sheet.categories.length > 4 && (
                <span className="text-[10px]">
                  +{sheet.categories.length - 4}
                </span>
              )}
            </div>

            {/* Description */}
            {sheet.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground/90">
                {sheet.description}
              </p>
            )}

            {/* Action row */}
            <div className="flex items-center gap-1 pt-1.5">
              {sheet.sheet_url && (
                <Button
                  asChild
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                >
                  <a href={sheet.sheet_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="!h-3 !w-3" />
                    Open
                  </a>
                </Button>
              )}
              {sheet.web_app_url && (
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="h-7 gap-1 px-2.5 text-xs"
                >
                  <a href={sheet.web_app_url} target="_blank" rel="noreferrer">
                    <Globe className="!h-3 !w-3" />
                    App
                  </a>
                </Button>
              )}
              <div
                className={cn(
                  "ml-auto flex items-center gap-0.5 transition-opacity",
                  "opacity-60 group-hover:opacity-100",
                )}
              >
                {!archived && onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onEdit(sheet)}
                        disabled={busy}
                      >
                        <Pencil className="!h-3.5 !w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                )}
                {!archived && onArchive && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onArchive(sheet)}
                        disabled={busy}
                      >
                        <Archive className="!h-3.5 !w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Archive</TooltipContent>
                  </Tooltip>
                )}
                {archived && onRestore && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onRestore(sheet)}
                        disabled={busy}
                      >
                        <RefreshCw className="!h-3.5 !w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: SheetItem["status"] }) {
  const tone =
    status === "active"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : status === "draft"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
        tone,
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          status === "active"
            ? "bg-emerald-500"
            : status === "draft"
              ? "bg-amber-500"
              : "bg-muted-foreground/60",
        )}
      />
      {status}
    </span>
  );
}

function SheetGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}
