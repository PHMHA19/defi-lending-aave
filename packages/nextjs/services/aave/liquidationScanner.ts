import { getAddress, type Address } from "viem";
import { getSupabaseAdminClient } from "../supabase/server";

const WATCHLIST_TABLE = "liquidation_watchlist";
const CANDIDATES_TABLE = "liquidation_candidates";
const DEFAULT_CHAIN_ID = 11155111;

export type LiquidationCandidate = {
  address: Address;
  healthFactor: number;
  updatedAt: string;
};

type WatchlistRow = {
  address: string;
};

type CandidateRow = {
  address: string;
  health_factor: number | string;
  updated_at: string;
};

function resolveChainId(chainId?: number) {
  return Number.isFinite(chainId ?? NaN) ? (chainId as number) : DEFAULT_CHAIN_ID;
}

function normalizeAddress(address: string): Address {
  return getAddress(address) as Address;
}

export async function readLiquidationWatchlist(chainId?: number): Promise<Address[]> {
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

export async function addBorrowerToWatchlist(
  address: string,
  chainId?: number,
): Promise<Address[]> {
  const resolvedChainId = resolveChainId(chainId);
  const normalized = normalizeAddress(address);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from(WATCHLIST_TABLE).upsert(
    {
      chain_id: resolvedChainId,
      address: normalized,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "chain_id,address",
    },
  );

  if (error) {
    throw new Error(`Không thể thêm ví vào watchlist: ${error.message}`);
  }

  return readLiquidationWatchlist(resolvedChainId);
}

export async function removeBorrowerFromWatchlist(
  address: string,
  chainId?: number,
): Promise<Address[]> {
  const resolvedChainId = resolveChainId(chainId);
  const normalized = normalizeAddress(address);
  const supabase = getSupabaseAdminClient();

  const [{ error: watchlistError }, { error: candidateError }] = await Promise.all([
    supabase
      .from(WATCHLIST_TABLE)
      .delete()
      .eq("chain_id", resolvedChainId)
      .eq("address", normalized),
    supabase
      .from(CANDIDATES_TABLE)
      .delete()
      .eq("chain_id", resolvedChainId)
      .eq("address", normalized),
  ]);

  if (watchlistError) {
    throw new Error(`Không thể xóa ví khỏi watchlist: ${watchlistError.message}`);
  }

  if (candidateError) {
    throw new Error(`Không thể xóa candidate: ${candidateError.message}`);
  }

  return readLiquidationWatchlist(resolvedChainId);
}

export async function readLiquidationCandidates(
  chainId?: number,
): Promise<LiquidationCandidate[]> {
  const resolvedChainId = resolveChainId(chainId);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from(CANDIDATES_TABLE)
    .select("address, health_factor, updated_at")
    .eq("chain_id", resolvedChainId)
    .order("health_factor", { ascending: true });

  if (error) {
    throw new Error(`Không thể đọc liquidation candidates: ${error.message}`);
  }

  const rows = (data ?? []) as CandidateRow[];

  return rows.map(row => ({
    address: normalizeAddress(row.address),
    healthFactor: Number(row.health_factor),
    updatedAt: row.updated_at,
  }));
}