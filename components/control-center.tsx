"use client";

import * as React from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import {
  Plus,
  Search as SearchIcon,
  RefreshCw,
  Star,
  Globe,
  Archive,
  FileSpreadsheet,
  LinkIcon,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";

import { SheetCard } from "@/components/sheet-card";
import { ResourceCard } from "@/components/resource-card";
import { SheetDrawer } from "@/components/sheet-drawer";
import { ResourceDrawer } from "@/components/resource-drawer";
import { EmptyState } from "@/components/empty-state";
import { CategoryMultiselect } from "@/components/category-multiselect";

import { useCategories, useResources, useSheets } from "@/hooks/use-data";
import { RESOURCE_TYPES, type ResourceItem, type SheetItem } from "@/lib/types";
import type { ResourceFormValues, SheetFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type MainTab = "sheets" | "resources" | "all";

interface ControlCenterProps {
  archived?: boolean;
}

export function ControlCenter({ archived = false }: ControlCenterProps) {
  const { mutate } = useSWRConfig();
  const sheetsQuery = useSheets(archived);
  const resourcesQuery = useResources(archived);
  const categoriesQuery = useCategories();

  const sheets = sheetsQuery.data ?? [];
  const resources = resourcesQuery.data ?? [];
  const categorySuggestions = categoriesQuery.data ?? [];

  const [tab, setTab] = React.useState<MainTab>("sheets");
  const [search, setSearch] = React.useState("");

  // Sheets filters
  const [sheetStatus, setSheetStatus] = React.useState<string>("all");
  const [sheetFavorite, setSheetFavorite] = React.useState<string>("all");
  const [sheetHasWebApp, setSheetHasWebApp] = React.useState<string>("all");
  const [sheetCats, setSheetCats] = React.useState<string[]>([]);

  // Resources filters
  const [resStatus, setResStatus] = React.useState<string>("all");
  const [resFavorite, setResFavorite] = React.useState<string>("all");
  const [resSource, setResSource] = React.useState<string>("all");
  const [resType, setResType] = React.useState<string>("all");
  const [resCats, setResCats] = React.useState<string[]>([]);

  // All-tab filters
  const [allItemType, setAllItemType] = React.useState<string>("all");
  const [allFavorite, setAllFavorite] = React.useState<string>("all");
  const [allCats, setAllCats] = React.useState<string[]>([]);

  // Drawers
  const [sheetDrawer, setSheetDrawer] = React.useState<{
    open: boolean;
    initial: SheetItem | null;
  }>({ open: false, initial: null });
  const [resourceDrawer, setResourceDrawer] = React.useState<{
    open: boolean;
    initial: ResourceItem | null;
  }>({ open: false, initial: null });

  const [busyId, setBusyId] = React.useState<string | null>(null);

  // ---------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------
  const filteredSheets = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return sheets.filter((s) => {
      if (q) {
        const haystack = [
          s.name,
          s.description,
          s.notes,
          ...s.categories,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (sheetStatus !== "all" && s.status !== sheetStatus) return false;
      if (sheetFavorite === "yes" && !s.favorite) return false;
      if (sheetFavorite === "no" && s.favorite) return false;
      if (sheetHasWebApp === "yes" && !s.web_app_url) return false;
      if (sheetHasWebApp === "no" && s.web_app_url) return false;
      if (sheetCats.length > 0) {
        const has = sheetCats.some((c) => s.categories.includes(c));
        if (!has) return false;
      }
      return true;
    });
  }, [sheets, search, sheetStatus, sheetFavorite, sheetHasWebApp, sheetCats]);

  const filteredResources = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      if (q) {
        const haystack = [
          r.title,
          r.description,
          r.notes,
          ...r.categories,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (resStatus !== "all" && r.status !== resStatus) return false;
      if (resFavorite === "yes" && !r.favorite) return false;
      if (resFavorite === "no" && r.favorite) return false;
      if (resSource !== "all" && r.source !== resSource) return false;
      if (resType !== "all" && r.resource_type !== resType) return false;
      if (resCats.length > 0) {
        const has = resCats.some((c) => r.categories.includes(c));
        if (!has) return false;
      }
      return true;
    });
  }, [
    resources,
    search,
    resStatus,
    resFavorite,
    resSource,
    resType,
    resCats,
  ]);

  const allFilteredSheets = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return sheets.filter((s) => {
      if (q) {
        const haystack = [s.name, s.description, s.notes, ...s.categories]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (allItemType === "resources") return false;
      if (allFavorite === "yes" && !s.favorite) return false;
      if (allFavorite === "no" && s.favorite) return false;
      if (allCats.length > 0) {
        if (!allCats.some((c) => s.categories.includes(c))) return false;
      }
      return true;
    });
  }, [sheets, search, allItemType, allFavorite, allCats]);

  const allFilteredResources = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      if (q) {
        const haystack = [r.title, r.description, r.notes, ...r.categories]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (allItemType === "sheets") return false;
      if (allFavorite === "yes" && !r.favorite) return false;
      if (allFavorite === "no" && r.favorite) return false;
      if (allCats.length > 0) {
        if (!allCats.some((c) => r.categories.includes(c))) return false;
      }
      return true;
    });
  }, [resources, search, allItemType, allFavorite, allCats]);

  // ---------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------
  async function refreshAll() {
    await Promise.all([
      mutate("/api/sheets" + (archived ? "?archived=true" : "")),
      mutate("/api/resources" + (archived ? "?archived=true" : "")),
      mutate("/api/categories"),
    ]);
  }

  async function handleSheetSubmit(values: SheetFormValues) {
    const editing = sheetDrawer.initial;
    const url = editing ? `/api/sheets/${editing.id}` : "/api/sheets";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(body.error || "Failed to save sheet");
      throw new Error(body.error || "Save failed");
    }
    toast.success(editing ? "Sheet updated" : "Sheet added");
    setSheetDrawer({ open: false, initial: null });
    await refreshAll();
  }

  async function handleResourceSubmit(values: ResourceFormValues) {
    const editing = resourceDrawer.initial;
    const url = editing ? `/api/resources/${editing.id}` : "/api/resources";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(body.error || "Failed to save resource");
      throw new Error(body.error || "Save failed");
    }
    toast.success(editing ? "Resource updated" : "Resource added");
    setResourceDrawer({ open: false, initial: null });
    await refreshAll();
  }

  async function archiveSheet(s: SheetItem) {
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/sheets/${s.id}/archive`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Archive failed");
        return;
      }
      toast.success(`Archived "${s.name}"`);
      await refreshAll();
    } finally {
      setBusyId(null);
    }
  }

  async function restoreSheet(s: SheetItem) {
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/sheets/${s.id}/restore`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Restore failed");
        return;
      }
      toast.success(`Restored "${s.name}"`);
      await refreshAll();
    } finally {
      setBusyId(null);
    }
  }

  async function archiveResource(r: ResourceItem) {
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/resources/${r.id}/archive`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Archive failed");
        return;
      }
      toast.success(`Archived "${r.title}"`);
      await refreshAll();
    } finally {
      setBusyId(null);
    }
  }

  async function restoreResource(r: ResourceItem) {
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/resources/${r.id}/restore`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Restore failed");
        return;
      }
      toast.success(`Restored "${r.title}"`);
      await refreshAll();
    } finally {
      setBusyId(null);
    }
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  const sheetsLoading = sheetsQuery.isLoading;
  const resourcesLoading = resourcesQuery.isLoading;
  const sheetsError = sheetsQuery.error as Error | undefined;
  const resourcesError = resourcesQuery.error as Error | undefined;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Top hero */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {archived ? "Archived" : "Control Center"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {archived
                ? "Restore archived sheets and resources back into circulation."
                : "Search, edit, and manage your sheets and useful resources."}
            </p>
          </div>
          {!archived && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSheetDrawer({ open: true, initial: null })}
              >
                <Plus />
                Add Sheet
              </Button>
              <Button
                onClick={() =>
                  setResourceDrawer({ open: true, initial: null })
                }
              >
                <Plus />
                Add Resource
              </Button>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, category, description, or notes..."
            className="h-11 pl-10 pr-12 text-base shadow-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => refreshAll()}
            aria-label="Refresh"
          >
            <RefreshCw className={cn(sheetsQuery.isValidating && "animate-spin")} />
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as MainTab)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="sheets" className="gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Sheets
                <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
                  {sheets.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                Resources
                <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
                  {resources.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>

          {/* Sheets tab */}
          <TabsContent value="sheets" className="space-y-4">
            <FilterBar>
              <FilterSelect
                label="Status"
                value={sheetStatus}
                onChange={setSheetStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "draft", label: "Draft" },
                  { value: "archived", label: "Archived" },
                ]}
                Icon={Archive}
              />
              <FilterSelect
                label="Favorite"
                value={sheetFavorite}
                onChange={setSheetFavorite}
                options={[
                  { value: "all", label: "All" },
                  { value: "yes", label: "Favorites" },
                  { value: "no", label: "Not favorites" },
                ]}
                Icon={Star}
              />
              <FilterSelect
                label="Web App"
                value={sheetHasWebApp}
                onChange={setSheetHasWebApp}
                options={[
                  { value: "all", label: "Any" },
                  { value: "yes", label: "Has web app" },
                  { value: "no", label: "No web app" },
                ]}
                Icon={Globe}
              />
              <CategoryMultiselect
                options={categorySuggestions}
                selected={sheetCats}
                onChange={setSheetCats}
              />
            </FilterBar>

            {sheetsError ? (
              <ErrorState message={sheetsError.message} onRetry={refreshAll} />
            ) : sheetsLoading ? (
              <CardGridSkeleton />
            ) : filteredSheets.length === 0 ? (
              <EmptyState
                icon={FileSpreadsheet}
                title={
                  sheets.length === 0
                    ? archived
                      ? "No archived sheets"
                      : "No sheets yet"
                    : "No sheets match your filters"
                }
                description={
                  sheets.length === 0 && !archived
                    ? "Add your first sheet to start building your control center."
                    : "Try clearing the search or adjusting filters."
                }
                action={
                  sheets.length === 0 && !archived ? (
                    <Button
                      onClick={() =>
                        setSheetDrawer({ open: true, initial: null })
                      }
                    >
                      <Plus />
                      Add Sheet
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <CardGrid>
                <AnimatePresence mode="popLayout">
                  {filteredSheets.map((s) => (
                    <SheetCard
                      key={s.id}
                      sheet={s}
                      busy={busyId === s.id}
                      archived={archived}
                      onEdit={(item) =>
                        setSheetDrawer({ open: true, initial: item })
                      }
                      onArchive={archiveSheet}
                      onRestore={restoreSheet}
                    />
                  ))}
                </AnimatePresence>
              </CardGrid>
            )}
          </TabsContent>

          {/* Resources tab */}
          <TabsContent value="resources" className="space-y-4">
            <FilterBar>
              <FilterSelect
                label="Status"
                value={resStatus}
                onChange={setResStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "archived", label: "Archived" },
                ]}
                Icon={Archive}
              />
              <FilterSelect
                label="Favorite"
                value={resFavorite}
                onChange={setResFavorite}
                options={[
                  { value: "all", label: "All" },
                  { value: "yes", label: "Favorites" },
                  { value: "no", label: "Not favorites" },
                ]}
                Icon={Star}
              />
              <FilterSelect
                label="Source"
                value={resSource}
                onChange={setResSource}
                options={[
                  { value: "all", label: "Any source" },
                  { value: "internal", label: "Internal" },
                  { value: "external", label: "External" },
                ]}
              />
              <FilterSelect
                label="Type"
                value={resType}
                onChange={setResType}
                options={[
                  { value: "all", label: "Any type" },
                  ...RESOURCE_TYPES.map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  })),
                ]}
              />
              <CategoryMultiselect
                options={categorySuggestions}
                selected={resCats}
                onChange={setResCats}
              />
            </FilterBar>

            {resourcesError ? (
              <ErrorState
                message={resourcesError.message}
                onRetry={refreshAll}
              />
            ) : resourcesLoading ? (
              <CardGridSkeleton />
            ) : filteredResources.length === 0 ? (
              <EmptyState
                icon={LinkIcon}
                title={
                  resources.length === 0
                    ? archived
                      ? "No archived resources"
                      : "No resources yet"
                    : "No resources match your filters"
                }
                description={
                  resources.length === 0 && !archived
                    ? "Add useful links, docs, dashboards, and tools."
                    : "Try clearing the search or adjusting filters."
                }
                action={
                  resources.length === 0 && !archived ? (
                    <Button
                      onClick={() =>
                        setResourceDrawer({ open: true, initial: null })
                      }
                    >
                      <Plus />
                      Add Resource
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <CardGrid>
                <AnimatePresence mode="popLayout">
                  {filteredResources.map((r) => (
                    <ResourceCard
                      key={r.id}
                      resource={r}
                      busy={busyId === r.id}
                      archived={archived}
                      onEdit={(item) =>
                        setResourceDrawer({ open: true, initial: item })
                      }
                      onArchive={archiveResource}
                      onRestore={restoreResource}
                    />
                  ))}
                </AnimatePresence>
              </CardGrid>
            )}
          </TabsContent>

          {/* All tab */}
          <TabsContent value="all" className="space-y-4">
            <FilterBar>
              <FilterSelect
                label="Type"
                value={allItemType}
                onChange={setAllItemType}
                options={[
                  { value: "all", label: "All items" },
                  { value: "sheets", label: "Sheets only" },
                  { value: "resources", label: "Resources only" },
                ]}
              />
              <FilterSelect
                label="Favorite"
                value={allFavorite}
                onChange={setAllFavorite}
                options={[
                  { value: "all", label: "All" },
                  { value: "yes", label: "Favorites" },
                  { value: "no", label: "Not favorites" },
                ]}
                Icon={Star}
              />
              <CategoryMultiselect
                options={categorySuggestions}
                selected={allCats}
                onChange={setAllCats}
              />
            </FilterBar>

            {sheetsLoading || resourcesLoading ? (
              <CardGridSkeleton />
            ) : (
              <div className="space-y-8">
                {allItemType !== "resources" && (
                  <Section
                    title="Sheets"
                    count={allFilteredSheets.length}
                    icon={FileSpreadsheet}
                  >
                    {allFilteredSheets.length === 0 ? (
                      <SubtleEmpty text="No sheets match." />
                    ) : (
                      <CardGrid>
                        <AnimatePresence mode="popLayout">
                          {allFilteredSheets.map((s) => (
                            <SheetCard
                              key={s.id}
                              sheet={s}
                              busy={busyId === s.id}
                              archived={archived}
                              onEdit={(item) =>
                                setSheetDrawer({ open: true, initial: item })
                              }
                              onArchive={archiveSheet}
                              onRestore={restoreSheet}
                            />
                          ))}
                        </AnimatePresence>
                      </CardGrid>
                    )}
                  </Section>
                )}
                {allItemType !== "sheets" && (
                  <Section
                    title="Resources"
                    count={allFilteredResources.length}
                    icon={LinkIcon}
                  >
                    {allFilteredResources.length === 0 ? (
                      <SubtleEmpty text="No resources match." />
                    ) : (
                      <CardGrid>
                        <AnimatePresence mode="popLayout">
                          {allFilteredResources.map((r) => (
                            <ResourceCard
                              key={r.id}
                              resource={r}
                              busy={busyId === r.id}
                              archived={archived}
                              onEdit={(item) =>
                                setResourceDrawer({
                                  open: true,
                                  initial: item,
                                })
                              }
                              onArchive={archiveResource}
                              onRestore={restoreResource}
                            />
                          ))}
                        </AnimatePresence>
                      </CardGrid>
                    )}
                  </Section>
                )}
                {allFilteredSheets.length === 0 &&
                  allFilteredResources.length === 0 && (
                    <EmptyState
                      icon={Inbox}
                      title="Nothing to show"
                      description="Try a different search or clear your filters."
                    />
                  )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Drawers */}
      <SheetDrawer
        open={sheetDrawer.open}
        onOpenChange={(o) =>
          setSheetDrawer((s) => ({ ...s, open: o, initial: o ? s.initial : null }))
        }
        initial={sheetDrawer.initial}
        categorySuggestions={categorySuggestions}
        onSubmit={handleSheetSubmit}
      />
      <ResourceDrawer
        open={resourceDrawer.open}
        onOpenChange={(o) =>
          setResourceDrawer((s) => ({
            ...s,
            open: o,
            initial: o ? s.initial : null,
          }))
        }
        initial={resourceDrawer.initial}
        categorySuggestions={categorySuggestions}
        sheets={sheets}
        onSubmit={handleResourceSubmit}
      />
    </TooltipProvider>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card/40 px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground pr-1">
        Filters
      </span>
      {children}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  Icon?: React.ElementType;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[140px] gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}

function Section({
  title,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.section layout className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </motion.section>
  );
}

function SubtleEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-card/30 px-6 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
      <h3 className="font-semibold text-destructive">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw />
        Try again
      </Button>
    </div>
  );
}
