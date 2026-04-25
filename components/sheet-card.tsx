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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SheetItem } from "@/lib/types";

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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group h-full hover:shadow-card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <div className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 shrink-0">
                <SheetIcon />
              </div>
              <div className="min-w-0">
                <div className="font-semibold leading-snug text-foreground line-clamp-2">
                  {sheet.name || "Untitled sheet"}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="soft" className="font-normal capitalize">
                    {sheet.status}
                  </Badge>
                  {sheet.web_app_url && (
                    <Badge variant="soft" className="font-normal gap-1">
                      <Globe className="h-3 w-3" />
                      web app
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {sheet.favorite && (
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
          {sheet.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {sheet.description}
            </p>
          )}
          {sheet.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {sheet.categories.map((c) => (
                <Badge key={c} variant="outline" className="font-normal">
                  {c}
                </Badge>
              ))}
            </div>
          )}
          {sheet.notes && (
            <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{sheet.notes}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2 pt-0">
          {sheet.sheet_url && (
            <Button asChild size="sm" variant="default">
              <a href={sheet.sheet_url} target="_blank" rel="noreferrer">
                <ExternalLink />
                Open Sheet
              </a>
            </Button>
          )}
          {sheet.web_app_url && (
            <Button asChild size="sm" variant="secondary">
              <a href={sheet.web_app_url} target="_blank" rel="noreferrer">
                <Globe />
                Web App
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
                    onClick={() => onEdit(sheet)}
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
                    onClick={() => onArchive(sheet)}
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
                    onClick={() => onRestore(sheet)}
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

function SheetIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}
