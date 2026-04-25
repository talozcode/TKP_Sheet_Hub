"use client";

import useSWR from "swr";
import type { ResourceItem, SheetItem } from "@/lib/types";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
};

export function useSheets(archived = false) {
  return useSWR<SheetItem[]>(
    `/api/sheets${archived ? "?archived=true" : ""}`,
    fetcher,
    { revalidateOnFocus: false },
  );
}

export function useResources(archived = false) {
  return useSWR<ResourceItem[]>(
    `/api/resources${archived ? "?archived=true" : ""}`,
    fetcher,
    { revalidateOnFocus: false },
  );
}

export function useCategories() {
  return useSWR<string[]>("/api/categories", fetcher, {
    revalidateOnFocus: false,
  });
}
