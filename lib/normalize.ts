/**
 * Convert a comma-separated string of categories into a normalized array:
 * trimmed, lowercased, deduplicated, sorted.
 */
export function parseCategories(value: string | undefined | null): string[] {
  if (!value) return [];
  return normalizeCategories(value.split(","));
}

export function normalizeCategories(input: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) continue;
    if (seen.has(cleaned)) continue;
    seen.add(cleaned);
    out.push(cleaned);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

export function categoriesToCell(categories: string[]): string {
  return normalizeCategories(categories).join(", ");
}

export function parseBoolean(value: unknown): boolean {
  if (value === true) return true;
  if (value === false || value === undefined || value === null) return false;
  const v = String(value).trim().toLowerCase();
  return ["true", "yes", "y", "1", "x", "✓", "checked", "favorite"].includes(v);
}

export function booleanToCell(value: boolean): string {
  return value ? "TRUE" : "FALSE";
}

export function toStringCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}
