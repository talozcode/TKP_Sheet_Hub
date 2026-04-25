"use client";

import * as React from "react";
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
import { Loader2 } from "lucide-react";
import type { SheetItem } from "@/lib/types";
import { sheetInputSchema, type SheetFormValues } from "@/lib/schemas";

interface SheetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SheetItem | null;
  categorySuggestions: string[];
  onSubmit: (values: SheetFormValues) => Promise<void>;
}

const empty: SheetFormValues = {
  name: "",
  sheet_url: "",
  categories: [],
  web_app_url: "",
  description: "",
  status: "active",
  favorite: false,
  notes: "",
};

export function SheetDrawer({
  open,
  onOpenChange,
  initial,
  categorySuggestions,
  onSubmit,
}: SheetDrawerProps) {
  const [values, setValues] = React.useState<SheetFormValues>(empty);
  const [errors, setErrors] = React.useState<Partial<Record<keyof SheetFormValues, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setErrors({});
      if (initial) {
        setValues({
          name: initial.name,
          sheet_url: initial.sheet_url,
          categories: initial.categories,
          web_app_url: initial.web_app_url,
          description: initial.description,
          status: initial.status,
          favorite: initial.favorite,
          notes: initial.notes,
        });
      } else {
        setValues(empty);
      }
    }
  }, [open, initial]);

  function update<K extends keyof SheetFormValues>(key: K, val: SheetFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = sheetInputSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof SheetFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SheetFormValues;
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
            <SheetTitle>{initial ? "Edit Sheet" : "Add Sheet"}</SheetTitle>
            <SheetDescription>
              {initial
                ? "Update this sheet entry. Changes save back to Google Sheets."
                : "Add a new entry to the sheets tab."}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-5">
            <div className="space-y-5">
              <Field label="Name" error={errors.name} required>
                <Input
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Q3 Marketing Tracker"
                />
              </Field>

              <Field label="Sheet URL" error={errors.sheet_url} required>
                <Input
                  value={values.sheet_url}
                  onChange={(e) => update("sheet_url", e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </Field>

              <Field label="Web App URL" error={errors.web_app_url}>
                <Input
                  value={values.web_app_url}
                  onChange={(e) => update("web_app_url", e.target.value)}
                  placeholder="Optional companion app URL"
                />
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
                  placeholder="What is this sheet for?"
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <Select
                    value={values.status}
                    onValueChange={(v) => update("status", v as SheetFormValues["status"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
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
                  placeholder="Free-form notes, links, ownership, etc."
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
              {initial ? "Save Changes" : "Add Sheet"}
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
