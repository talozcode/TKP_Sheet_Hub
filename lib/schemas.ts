import { z } from "zod";
import { RESOURCE_TYPES } from "./types";

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (val) => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL" },
  );

export const sheetInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  sheet_url: optionalUrl.refine((v) => v.length > 0, {
    message: "Sheet URL is required",
  }),
  categories: z.array(z.string()).default([]),
  web_app_url: optionalUrl.optional().default(""),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  favorite: z.boolean().default(false),
  notes: z.string().max(5000).optional().default(""),
});

export const resourceInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  url: optionalUrl.refine((v) => v.length > 0, {
    message: "URL is required",
  }),
  categories: z.array(z.string()).default([]),
  resource_type: z.enum(["", ...RESOURCE_TYPES]).default(""),
  source: z.enum(["", "internal", "external"]).default(""),
  related_sheet_id: z.string().optional().default(""),
  description: z.string().max(2000).optional().default(""),
  favorite: z.boolean().default(false),
  status: z.enum(["active", "archived"]).default("active"),
  notes: z.string().max(5000).optional().default(""),
});

export type SheetFormValues = z.infer<typeof sheetInputSchema>;
export type ResourceFormValues = z.infer<typeof resourceInputSchema>;
