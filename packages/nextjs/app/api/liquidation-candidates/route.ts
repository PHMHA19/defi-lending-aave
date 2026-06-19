import { NextRequest, NextResponse } from "next/server";
import {
  readLiquidationCandidates,
} from "~~/services/aave/liquidationScanner";
import {
  syncLiquidationCandidates,
} from "~~/services/aave/liquidationSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const refresh = request.nextUrl.searchParams.get("refresh") === "1";

  const parsedChainId = Number(chainIdParam);
  const chainId = Number.isFinite(parsedChainId) ? parsedChainId : undefined;

  if (refresh) {
    await syncLiquidationCandidates(chainId);
  }

  const candidates = await readLiquidationCandidates(chainId);

  return NextResponse.json({
    candidates,
    count: candidates.length,
  });
}