import { getLiquidationPreview } from "./liquidation";
import {
  readLiquidationCandidates,
  readLiquidationWatchlist,
  type LiquidationCandidate,
} from "./liquidationScanner";
import { getSupabaseAdminClient } from "../supabase/server";

const CANDIDATES_TABLE = "liquidation_candidates";
const HF_ALERT_THRESHOLD = 1.1;
const DEFAULT_CHAIN_ID = 11155111;

function resolveChainId(chainId?: number) {
  return Number.isFinite(chainId ?? NaN) ? (chainId as number) : DEFAULT_CHAIN_ID;
}

async function upsertCandidate(
  address: string,
  healthFactor: number,
  chainId?: number,
) {
  const resolvedChainId = resolveChainId(chainId);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from(CANDIDATES_TABLE).upsert(
    {
      chain_id: resolvedChainId,
      address,
      health_factor: healthFactor,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "chain_id,address",
    },
  );

  if (error) {
    throw new Error(`Không thể lưu liquidation candidate: ${error.message}`);
  }
}

async function deleteCandidate(address: string, chainId?: number) {
  const resolvedChainId = resolveChainId(chainId);
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from(CANDIDATES_TABLE)
    .delete()
    .eq("chain_id", resolvedChainId)
    .eq("address", address);

  if (error) {
    throw new Error(`Không thể xóa liquidation candidate: ${error.message}`);
  }
}

export async function syncLiquidationCandidates(
  chainId?: number,
): Promise<LiquidationCandidate[]> {
  const resolvedChainId = resolveChainId(chainId);
  const watchlist = await readLiquidationWatchlist(resolvedChainId);

  await Promise.allSettled(
    watchlist.map(async address => {
      try {
        const preview = await getLiquidationPreview(address, resolvedChainId);
        const hf = Number(preview.healthFactor);

        if (!Number.isFinite(hf)) {
          await deleteCandidate(address, resolvedChainId);
          return;
        }

        if (hf < HF_ALERT_THRESHOLD) {
          await upsertCandidate(address, hf, resolvedChainId);
        } else {
          await deleteCandidate(address, resolvedChainId);
        }
      } catch (error) {
        console.error(`syncLiquidationCandidates(${address}) failed`, error);
      }
    }),
  );

  return readLiquidationCandidates(resolvedChainId);
}