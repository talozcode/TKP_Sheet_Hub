"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryInput } from "@/components/category-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RESOURCE_TYPES, type ResourceItem, type SheetItem } from "@/lib/types";
import { resourceInputSchema, type ResourceFormValues } from "@/lib/schemas";

interface ResourceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ResourceItem | null;
  categorySuggestions: string[];
  sheets: SheetItem[];
  onSubmit: (values: ResourceFormValues) => Promise<void>;
}

const empty: ResourceFormValues = {
  title: "",
  url: "",
  categories: [],
  resource_type: "",
  source: "",
  related_sheet_id: "",
  description: "",
  favorite: false,
  status: "active",
  notes: "",
};

export function ResourceDrawer({
  open,
  onOpenChange,
  initial,
  categorySuggestions,
  sheets,
  onSubmit,
}: ResourceDrawerProps) {
  const [values, setValues] = React.useState<ResourceFormValues>(empty);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ResourceFormValues, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setErrors({});
      if (initial) {
        setValues({
          title: initial.title,
          url: initial.url,
          categories: initial.categories,
          resource_type: initial.resource_type,
          source: initial.source,
          related_sheet_id: initial.related_sheet_id,
          description: initial.description,
          favorite: initial.favorite,
          status: initial.status,
          notes: initial.notes,
        });
      } else {
        setValues(empty);
      }
    }
  }, [open, initial]);

  function update<K extends keyof ResourceFormValues>(
    key: K,
    val: ResourceFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resourceInputSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof ResourceFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ResourceFormValues;
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{initial ? "Edit Resource" : "Add Resource"}</SheetTitle>
            <SheetDescription>
              {initial
                ? "Update this resource entry. Changes save back to Google Sheets."
                : "Add a new entry to the resources tab."}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-5">
            <div className="space-y-5">
              <Field label="Title" error={errors.title} required>
                <Input
                  value={values.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Brand guidelines"
                />
              </Field>

              <Field label="URL" error={errors.url} required>
                <Input
                  value={values.url}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Resource Type">
                  <Select
                    value={values.resource_type}
                    onValueChange={(v) =>
                      update(
                        "resource_type",
                        v === "__none__" ? "" : (v as ResourceFormValues["resource_type"]),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {RESOURCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Source">
                  <Select
                    value={values.source}
                    onValueChange={(v) =>
                      update(
                        "source",
                        v === "__none__" ? "" : (v as ResourceFormValues["source"]),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Related Sheet">
                <Select
                  value={values.related_sheet_id || "__none__"}
                  onValueChange={(v) =>
                    update("related_sheet_id", v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {sheets.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name || s.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Categories">
                <CategoryInput
                  value={values.categories}
                  onChange={(next) => update("categories", next)}
                  suggestions={categorySuggestions}
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={values.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Brief description of this resource"
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <Select
                    value={values.status}
                    onValueChange={(v) =>
                      update("status", v as ResourceFormValues["status"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Favorite">
                  <div className="flex h-9 items-center">
                    <Switch
                      checked={values.favorite}
                      onCheckedChange={(v) => update("favorite", v)}
                    />
                    <span className="ml-3 text-sm text-muted-foreground">
                      {values.favorite ? "Marked as favorite" : "Not a favorite"}
                    </span>
                  </div>
                </Field>
              </div>

              <Field label="Notes">
                <Textarea
                  value={values.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Free-form notes"
                  rows={4}
                />
              </Field>
            </div>
          </ScrollArea>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {initial ? "Save Changes" : "Add Resource"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
