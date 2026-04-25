import { NextResponse } from "next/server";
import { updateResource } from "@/lib/google-sheets";
import { resourceInputSchema } from "@/lib/schemas";
import { normalizeCategories } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = resourceInputSchema.parse(body);
    const item = await updateResource(id, {
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
    return NextResponse.json({ data: item });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update resource" },
      { status: 400 },
    );
  }
}
