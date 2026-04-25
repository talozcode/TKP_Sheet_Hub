"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryMultiselectProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function CategoryMultiselect({
  options,
  selected,
  onChange,
}: CategoryMultiselectProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.includes(q));
  }, [options, query]);

  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 justify-between gap-2 font-normal",
            selected.length > 0 && "border-primary/40",
          )}
        >
          <span className="truncate">
            {selected.length === 0
              ? "Categories"
              : selected.length === 1
                ? selected[0]
                : `${selected.length} categories`}
          </span>
          {selected.length > 0 ? (
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange([]);
              }}
              aria-label="Clear categories"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDown className="h-4 w-4 opacity-60" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <Input
          placeholder="Filter categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2 h-8"
        />
        {selected.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {selected.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="font-normal pr-1 gap-1"
              >
                {s}
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-background/60"
                  onClick={() => toggle(s)}
                  aria-label={`Remove ${s}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <ScrollArea className="max-h-64">
          <div className="space-y-0.5">
            {filtered.length === 0 && (
              <div className="px-2 py-3 text-xs text-muted-foreground">
                No categories yet
              </div>
            )}
            {filtered.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    checked && "bg-accent/50",
                  )}
                >
                  <span>{opt}</span>
                  {checked && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
