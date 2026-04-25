import { NextResponse } from "next/server";
import { listAllCategories } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await listAllCategories();
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load categories" },
      { status: 500 },
    );
  }
}
