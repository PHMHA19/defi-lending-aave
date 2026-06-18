import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  addBorrowerToWatchlist,
  readLiquidationWatchlist,
  removeBorrowerFromWatchlist,
} from "~~/services/aave/liquidationScanner";

export const runtime = "nodejs";

export async function GET() {
  const borrowers = await readLiquidationWatchlist();
  return NextResponse.json({ borrowers, count: borrowers.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const address = body?.address;
    const action = body?.action ?? "add";
    if (
        action !== "add" &&
        action !== "remove"
        ) {
        return NextResponse.json(
            {
            error: "Invalid action",
            },
            {
            status: 400,
            },
        );
        }

    if (typeof address !== "string" || !address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    if (action === "remove") {
      const borrowers = await removeBorrowerFromWatchlist(address);
      return NextResponse.json({ borrowers, count: borrowers.length });
    }
    

    const borrowers = await addBorrowerToWatchlist(address);
    return NextResponse.json({ borrowers, count: borrowers.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}