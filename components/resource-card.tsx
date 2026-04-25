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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResourceItem, ResourceType } from "@/lib/types";

interface ResourceCardProps {
  resource: ResourceItem;
  onEdit?: (r: ResourceItem) => void;
  onArchive?: (r: ResourceItem) => void;
  onRestore?: (r: ResourceItem) => void;
  archived?: boolean;
  busy?: boolean;
}

const TYPE_META: Record<ResourceType | "default", { Icon: React.ElementType; tone: string }> = {
  doc: { Icon: FileText, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  sheet: { Icon: Layers, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  dashboard: {
    Icon: LayoutDashboard,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  tool: { Icon: Wrench, tone: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  guide: { Icon: BookOpen, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  template: {
    Icon: ClipboardList,
    tone: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  form: {
    Icon: ClipboardList,
    tone: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  folder: { Icon: Folder, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  website: { Icon: Globe2, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  article: { Icon: Newspaper, tone: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  reference: {
    Icon: Bookmark,
    tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  default: { Icon: Link2, tone: "bg-muted text-muted-foreground" },
};

export function ResourceCard({
  resource,
  onEdit,
  onArchive,
  onRestore,
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group h-full hover:shadow-card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <div className={`rounded-lg p-2 shrink-0 ${meta.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold leading-snug text-foreground line-clamp-2">
                  {resource.title || "Untitled resource"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {resource.resource_type && (
                    <Badge variant="soft" className="font-normal capitalize">
                      {resource.resource_type}
                    </Badge>
                  )}
                  {resource.source && (
                    <Badge variant="soft" className="font-normal capitalize">
                      {resource.source}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {resource.favorite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                </TooltipTrigger>
                <TooltipContent>Favorite</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {resource.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {resource.description}
            </p>
          )}
          {resource.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {resource.categories.map((c) => (
                <Badge key={c} variant="outline" className="font-normal">
                  {c}
                </Badge>
              ))}
            </div>
          )}
          {resource.notes && (
            <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{resource.notes}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2 pt-0">
          {resource.url && (
            <Button asChild size="sm" variant="default">
              <a href={resource.url} target="_blank" rel="noreferrer">
                <ExternalLink />
                Open Link
              </a>
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1">
            {!archived && onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(resource)}
                    disabled={busy}
                  >
                    <Pencil />
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
                    onClick={() => onArchive(resource)}
                    disabled={busy}
                  >
                    <Archive />
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
                    onClick={() => onRestore(resource)}
                    disabled={busy}
                  >
                    <RefreshCw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
