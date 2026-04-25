import { NextResponse } from "next/server";
import {
  listArchivedResources,
  listResources,
  createResource,
} from "@/lib/google-sheets";
import { resourceInputSchema } from "@/lib/schemas";
import { normalizeCategories } from "@/lib/normalize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived") === "true";
    const data = archived ? await listArchivedResources() : await listResources();
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load resources" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resourceInputSchema.parse(body);
    const item = await createResource({
      title: parsed.title,
      url: parsed.url,
      categories: normalizeCategories(parsed.categories),
      resource_type: parsed.resource_type,
      source: parsed.source,
      related_sheet_id: parsed.related_sheet_id ?? "",
      description: parsed.description ?? "",
      favorite: parsed.favorite,
      status: parsed.status,
      notes: parsed.notes ?? "",
    });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create resource" },
      { status: 400 },
    );
  }
}
