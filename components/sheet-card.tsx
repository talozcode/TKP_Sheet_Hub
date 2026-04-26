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
  onToggleFavorite?: (sheet: SheetItem) => void;
  archived?: boolean;
  busy?: boolean;
}

export function SheetCard({
  sheet,
  onEdit,
  onArchive,
  onRestore,
  onToggleFavorite,
  archived,
  busy,
}: SheetCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="group relative h-full"
    >
      <div className="relative flex h-full flex-col rounded-xl border border-border/80 bg-card p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover">
        <div className="flex flex-1 items-start gap-3">
          <div className="tile-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
            <SheetGlyph />
          </div>

          <div className="flex min-w-0 flex-1 flex-col space-y-1">
            {/* Title row + favorite */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground">
                {sheet.name || "Untitled sheet"}
              </h3>
              <div className="flex items-center gap-0.5 shrink-0">
                {sheet.notes && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground/70">
                        <StickyNote className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="max-w-xs whitespace-pre-line"
                    >
                      {sheet.notes}
                    </TooltipContent>
                  </Tooltip>
                )}
                {onToggleFavorite && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(sheet)}
                        disabled={busy}
                        aria-label={
                          sheet.favorite ? "Remove favorite" : "Mark as favorite"
                        }
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                          "hover:bg-muted",
                          sheet.favorite
                            ? "text-amber-500"
                            : "text-muted-foreground/50 hover:text-amber-500",
                        )}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            sheet.favorite && "fill-amber-400 text-amber-400 scale-110",
                          )}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {sheet.favorite ? "Unfavorite" : "Favorite"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-x-2 text-[11px] text-muted-foreground overflow-hidden">
              <StatusPill status={sheet.status} />
              {sheet.web_app_url && (
                <span className="inline-flex shrink-0 items-center gap-1">
                  <Globe className="h-2.5 w-2.5" />
                  web app
                </span>
              )}
              {sheet.categories.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="shrink-0 truncate max-w-[90px] rounded bg-muted px-1.5 py-0.5 text-[10px] tnum"
                >
                  {c}
                </span>
              ))}
              {sheet.categories.length > 2 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] tnum text-muted-foreground hover:bg-muted-foreground/10"
                    >
                      +{sheet.categories.length - 2}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {sheet.categories.slice(2).map((c) => (
                        <span
                          key={c}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Description */}
            <p className="line-clamp-2 min-h-[2lh] text-xs text-muted-foreground">
              {sheet.description || "\u00A0"}
            </p>

            {/* Action row */}
            <div className="mt-auto flex items-center gap-1 pt-1.5">
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
              <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {!archived && onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
  const styles =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400"
      : status === "draft"
        ? "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400"
        : "bg-muted text-muted-foreground ring-border";
  const dot =
    status === "active"
      ? "bg-emerald-500"
      : status === "draft"
        ? "bg-amber-500"
        : "bg-muted-foreground/60";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ring-1 ring-inset",
        styles,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
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
