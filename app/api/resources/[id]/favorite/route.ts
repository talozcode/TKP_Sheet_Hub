import { NextResponse } from "next/server";
import { updateResource } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { favorite?: boolean };
    const favorite = body.favorite === true;
    const item = await updateResource(id, { favorite });
    return NextResponse.json({ data: item });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to toggle favorite" },
      { status: 400 },
    );
  }
}
