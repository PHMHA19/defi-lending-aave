import { getAddress, type Address } from "viem";
import { getLiquidationPreview } from "./liquidation";
import { getSupabaseAdminClient } from "../supabase/server";

const WATCHLIST_TABLE = "liquidation_watchlist";
const DEFAULT_CHAIN_ID = 11155111;
const HF_ALERT_THRESHOLD = 1.1;

export type LiquidationCandidate = {
  address: Address;
  healthFactor: number;
  updatedAt: string;
};

type WatchlistRow = {
  address: string;
};

function resolveChainId(chainId?: number) {
  return Number.isFinite(chainId ?? NaN) ? (chainId as number) : DEFAULT_CHAIN_ID;
}

function normalizeAddress(address: string): Address {
  return getAddress(address) as Address;
}

async function readWatchlistAddresses(chainId?: number): Promise<Address[]> {
  const resolvedChainId = resolveChainId(chainId);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from(WATCHLIST_TABLE)
    .select("address")
    .eq("chain_id", resolvedChainId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Không thể đọc liquidation watchlist: ${error.message}`);
  }

  const rows = (data ?? []) as WatchlistRow[];

  const addresses = rows
    .map(row => row.address)
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .map(item => {
      try {
        return normalizeAddress(item);
      } catch {
        return null;
      }
    })
    .filter((item): item is Address => Boolean(item));

  return [...new Set(addresses)];
}

export async function readLiquidationWatchlist(chainId?: number): Promise<Address[]> {
  return readWatchlistAddresses(chainId);
}

export async function addBorrowerToWatchlist(address: string, chainId?: number): Promise<Address[]> {
  const normalized = normalizeAddress(address);
  const resolvedChainId = resolveChainId(chainId);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from(WATCHLIST_TABLE).upsert(
    {
      chain_id: resolvedChainId,
      address: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chain_id,address" },
  );

  if (error) {
    throw new Error(`Không thể thêm ví vào watchlist: ${error.message}`);
  }

  return readWatchlistAddresses(resolvedChainId);
}

export async function removeBorrowerFromWatchlist(address: string, chainId?: number): Promise<Address[]> {
  const normalized = normalizeAddress(address);
  const resolvedChainId = resolveChainId(chainId);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from(WATCHLIST_TABLE)
    .delete()
    .eq("chain_id", resolvedChainId)
    .eq("address", normalized);

  if (error) {
    throw new Error(`Không thể xóa ví khỏi watchlist: ${error.message}`);
  }

  return readWatchlistAddresses(resolvedChainId);
}

export async function scanLiquidationCandidates(chainId?: number): Promise<LiquidationCandidate[]> {
  const resolvedChainId = resolveChainId(chainId);
  const watchlist = await readWatchlistAddresses(resolvedChainId);

  const results = await Promise.all(
    watchlist.map(async address => {
      try {
        const preview = await getLiquidationPreview(address, resolvedChainId);
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