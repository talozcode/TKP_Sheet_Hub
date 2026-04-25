"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { normalizeCategories } from "@/lib/normalize";

interface CategoryInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export function CategoryInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Type a category and press Enter",
  className,
}: CategoryInputProps) {
  const [draft, setDraft] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredSuggestions = React.useMemo(() => {
    const q = draft.trim().toLowerCase();
    const current = new Set(value);
    return suggestions
      .filter((s) => !current.has(s) && (q.length === 0 || s.includes(q)))
      .slice(0, 8);
  }, [suggestions, draft, value]);

  function commit(raw: string) {
    const next = normalizeCategories([...value, raw]);
    onChange(next);
    setDraft("");
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent p-2 min-h-[42px] focus-within:ring-1 focus-within:ring-ring"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="rounded-full pr-1 gap-1 font-normal"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              className="rounded-full p-0.5 hover:bg-background/60"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 px-1 h-7"
        />
      </div>

      {open && filteredSuggestions.length > 0 && (
        <div className="rounded-md border bg-popover p-1 shadow-md">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-2 py-1">
            Suggestions
          </div>
          <div className="flex flex-wrap gap-1 p-1">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(s);
                }}
                className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-muted/70"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
