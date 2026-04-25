export type SheetStatus = "active" | "draft" | "archived";
export type ResourceStatus = "active" | "archived";
export type ResourceSource = "internal" | "external";

export const RESOURCE_TYPES = [
  "doc",
  "sheet",
  "dashboard",
  "tool",
  "guide",
  "template",
  "form",
  "folder",
  "website",
  "article",
  "reference",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export interface SheetItem {
  id: string;
  name: string;
  sheet_url: string;
  categories: string[];
  web_app_url: string;
  description: string;
  status: SheetStatus;
  favorite: boolean;
  notes: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  categories: string[];
  resource_type: ResourceType | "";
  source: ResourceSource | "";
  related_sheet_id: string;
  description: string;
  favorite: boolean;
  status: ResourceStatus;
  notes: string;
}

export type SheetInput = Omit<SheetItem, "id"> & { id?: string };
export type ResourceInput = Omit<ResourceItem, "id"> & { id?: string };

export interface SheetsApiResponse {
  sheets: SheetItem[];
  resources: ResourceItem[];
  categories: string[];
}
