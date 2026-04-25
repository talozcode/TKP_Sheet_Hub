import { NextResponse } from "next/server";
import { restoreSheet } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await restoreSheet(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to restore sheet" },
      { status: 400 },
    );
  }
}
