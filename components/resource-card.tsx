"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Pencil,
  Archive,
  Star,
  StickyNote,
  RefreshCw,
  FileText,
  LayoutDashboard,
  Wrench,
  BookOpen,
  Layers,
  ClipboardList,
  Folder,
  Globe2,
  Newspaper,
  Bookmark,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResourceItem, ResourceType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: ResourceItem;
  onEdit?: (r: ResourceItem) => void;
  onArchive?: (r: ResourceItem) => void;
  onRestore?: (r: ResourceItem) => void;
  onToggleFavorite?: (r: ResourceItem) => void;
  archived?: boolean;
  busy?: boolean;
}

const TYPE_META: Record<
  ResourceType | "default",
  { Icon: React.ElementType; tone: string }
> = {
  doc: { Icon: FileText, tone: "text-sky-600 dark:text-sky-300" },
  sheet: { Icon: Layers, tone: "text-emerald-600 dark:text-emerald-300" },
  dashboard: {
    Icon: LayoutDashboard,
    tone: "text-violet-600 dark:text-violet-300",
  },
  tool: { Icon: Wrench, tone: "text-orange-600 dark:text-orange-300" },
  guide: { Icon: BookOpen, tone: "text-rose-600 dark:text-rose-300" },
  template: { Icon: ClipboardList, tone: "text-cyan-600 dark:text-cyan-300" },
  form: {
    Icon: ClipboardList,
    tone: "text-yellow-700 dark:text-yellow-300",
  },
  folder: { Icon: Folder, tone: "text-amber-600 dark:text-amber-300" },
  website: { Icon: Globe2, tone: "text-teal-600 dark:text-teal-300" },
  article: { Icon: Newspaper, tone: "text-pink-600 dark:text-pink-300" },
  reference: { Icon: Bookmark, tone: "text-indigo-600 dark:text-indigo-300" },
  default: { Icon: Link2, tone: "text-muted-foreground" },
};

export function ResourceCard({
  resource,
  onEdit,
  onArchive,
  onRestore,
  onToggleFavorite,
  archived,
  busy,
}: ResourceCardProps) {
  const meta = resource.resource_type
    ? TYPE_META[resource.resource_type] || TYPE_META.default
    : TYPE_META.default;
  const Icon = meta.Icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="group relative"
    >
      <div className="relative rounded-lg border border-border bg-card p-3.5 shadow-card transition-colors duration-150 hover:border-primary/30 hover:shadow-card-hover">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "tile-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              meta.tone,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground">
                {resource.title || "Untitled resource"}
              </h3>
              <div className="flex items-center gap-0.5 shrink-0">
                {resource.notes && (
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
                      {resource.notes}
                    </TooltipContent>
                  </Tooltip>
                )}
                {onToggleFavorite && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(resource)}
                        disabled={busy}
                        aria-label={
                          resource.favorite
                            ? "Remove favorite"
                            : "Mark as favorite"
                        }
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                          "hover:bg-muted",
                          resource.favorite
                            ? "text-amber-500"
                            : "text-muted-foreground/50 hover:text-amber-500",
                        )}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            resource.favorite &&
                              "fill-amber-400 text-amber-400 scale-110",
                          )}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {resource.favorite ? "Unfavorite" : "Favorite"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              {resource.resource_type && (
                <span className="inline-flex items-center capitalize text-muted-foreground">
                  {resource.resource_type}
                </span>
              )}
              {resource.source && (
                <span className="capitalize">· {resource.source}</span>
              )}
              {resource.categories.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] tnum"
                >
                  {c}
                </span>
              ))}
              {resource.categories.length > 4 && (
                <span className="text-[10px] tnum">
                  +{resource.categories.length - 4}
                </span>
              )}
            </div>

            {resource.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {resource.description}
              </p>
            )}

            <div className="flex items-center gap-1 pt-1.5">
              {resource.url && (
                <Button
                  asChild
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                >
                  <a href={resource.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="!h-3 !w-3" />
                    Open
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
                        onClick={() => onEdit(resource)}
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
                        onClick={() => onArchive(resource)}
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
                        onClick={() => onRestore(resource)}
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
