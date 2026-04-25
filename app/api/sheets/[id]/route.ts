import { NextResponse } from "next/server";
import { updateSheet } from "@/lib/google-sheets";
import { sheetInputSchema } from "@/lib/schemas";
import { normalizeCategories } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = sheetInputSchema.parse(body);
    const item = await updateSheet(id, {
      name: parsed.name,
      sheet_url: parsed.sheet_url,
      categories: normalizeCategories(parsed.categories),
      web_app_url: parsed.web_app_url ?? "",
      description: parsed.description ?? "",
      status: parsed.status,
      favorite: parsed.favorite,
      notes: parsed.notes ?? "",
    });
    return NextResponse.json({ data: item });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update sheet" },
      { status: 400 },
    );
  }
}
