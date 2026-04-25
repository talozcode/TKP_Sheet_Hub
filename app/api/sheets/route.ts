import { NextResponse } from "next/server";
import { listArchivedSheets, listSheets, createSheet } from "@/lib/google-sheets";
import { sheetInputSchema } from "@/lib/schemas";
import { normalizeCategories } from "@/lib/normalize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived") === "true";
    const data = archived ? await listArchivedSheets() : await listSheets();
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load sheets" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sheetInputSchema.parse(body);
    const item = await createSheet({
      name: parsed.name,
      sheet_url: parsed.sheet_url,
      categories: normalizeCategories(parsed.categories),
      web_app_url: parsed.web_app_url ?? "",
      description: parsed.description ?? "",
      status: parsed.status,
      favorite: parsed.favorite,
      notes: parsed.notes ?? "",
    });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create sheet" },
      { status: 400 },
    );
  }
}
