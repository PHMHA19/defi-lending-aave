import { NextRequest, NextResponse } from "next/server";
import { backfillBorrowersFromEvents }
from "~~/services/aave/liquidationBackfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsedChainId = Number(body?.chainId);
    const chainId = Number.isFinite(parsedChainId) ? parsedChainId : undefined;

    const result = await backfillBorrowersFromEvents(chainId);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Backfill failed",
      },
      { status: 500 },
    );
  }
}