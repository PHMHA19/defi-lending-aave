import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  addBorrowerToWatchlist,
  readLiquidationWatchlist,
  removeBorrowerFromWatchlist,
} from "~~/services/aave/liquidationScanner";

export const runtime = "nodejs";

function parseChainId(value: string | null | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const chainId = parseChainId(chainIdParam);

  const borrowers = await readLiquidationWatchlist(chainId);
  return NextResponse.json({ borrowers, count: borrowers.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const address = body?.address;
    const action = body?.action ?? "add";
    const chainId = parseChainId(body?.chainId);

    if (action !== "add" && action !== "remove") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (typeof address !== "string" || !address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    let borrowers;
    if (action === "remove") {
      borrowers = await removeBorrowerFromWatchlist(address, chainId);
    } else {
      borrowers = await addBorrowerToWatchlist(address, chainId);
    }

    return NextResponse.json({ borrowers, count: borrowers.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}