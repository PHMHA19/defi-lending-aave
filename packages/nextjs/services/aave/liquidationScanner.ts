import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAddress, type Address } from "viem";
import { getLiquidationPreview } from "./liquidation";

const DATA_DIR = path.join(process.cwd(), "data");
const WATCHLIST_FILE = path.join(DATA_DIR, "liquidation-watchlist.json");
const HF_ALERT_THRESHOLD = 1.1;

export type LiquidationCandidate = {
  address: Address;
  healthFactor: number;
  updatedAt: string;
};

async function ensureWatchlistFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(WATCHLIST_FILE, "utf8");
  } catch {
    await writeFile(WATCHLIST_FILE, "[]", "utf8");
  }
}

export async function readLiquidationWatchlist(): Promise<Address[]> {
  await ensureWatchlistFile();

  const raw = await readFile(WATCHLIST_FILE, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const validAddresses = parsed
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .filter(item => {
      try {
        getAddress(item);
        return true;
      } catch {
        return false;
      }
    })
    .map(item => getAddress(item) as Address);

  return [...new Set(validAddresses)];
}

export async function addBorrowerToWatchlist(address: string): Promise<Address[]> {
  let normalized: Address;

  try {
    normalized = getAddress(address) as Address;
  } catch {
    throw new Error("Địa chỉ ví không hợp lệ.");
  }

  const current = await readLiquidationWatchlist();
  const next = [...new Set([...current, normalized])];

  await writeFile(WATCHLIST_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function removeBorrowerFromWatchlist(address: string): Promise<Address[]> {
  let normalized: Address;

  try {
    normalized = getAddress(address) as Address;
  } catch {
    throw new Error("Địa chỉ ví không hợp lệ.");
  }

  const current = await readLiquidationWatchlist();
  const next = current.filter(item => item.toLowerCase() !== normalized.toLowerCase());

  await writeFile(WATCHLIST_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function scanLiquidationCandidates(chainId?: number): Promise<LiquidationCandidate[]> {
  const watchlist = await readLiquidationWatchlist();

  const results = await Promise.all(
    watchlist.map(async (address) => {
      try {
        const preview = await getLiquidationPreview(address, chainId);
        const hf = Number(preview.healthFactor);

        if (!Number.isFinite(hf)) return null;
        if (hf >= HF_ALERT_THRESHOLD) return null;

        return {
          address,
          healthFactor: hf,
          updatedAt: new Date().toISOString(),
        } satisfies LiquidationCandidate;
      } catch (error) {
        console.error(`scanLiquidationCandidates(${address}) failed`, error);
        return null;
      }
    }),
  );

  return results
    .filter((item): item is LiquidationCandidate => Boolean(item))
    .sort((a, b) => a.healthFactor - b.healthFactor);
}

export async function pruneWatchlist(chainId?: number): Promise<Address[]> {
  const watchlist = await readLiquidationWatchlist();
  const remaining: Address[] = [];

  for (const address of watchlist) {
    try {
      const preview = await getLiquidationPreview(address, chainId);
      const hf = Number(preview.healthFactor);

      if (Number.isFinite(hf) && hf < HF_ALERT_THRESHOLD) {
        remaining.push(address);
      }
    } catch (error) {
      console.error(`pruneWatchlist(${address}) failed`, error);
      remaining.push(address);
    }
  }

  await writeFile(WATCHLIST_FILE, JSON.stringify(remaining, null, 2), "utf8");
  return remaining;
}