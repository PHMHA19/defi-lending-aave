import { NextRequest, NextResponse } from "next/server";
import { scanLiquidationCandidates } from "~~/services/aave/liquidationScanner";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const parsedChainId =
    Number(chainIdParam);

    const chainId =
    Number.isFinite(parsedChainId)
        ? parsedChainId
        : undefined;

  const candidates = await scanLiquidationCandidates(chainId);

  return NextResponse.json({
    candidates,
    count: candidates.length,
  });
}
export const dynamic = "force-dynamic";
export const revalidate = 0;