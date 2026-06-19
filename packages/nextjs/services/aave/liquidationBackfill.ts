import { getPublicClient } from "@wagmi/core";
import { getAddress, type Address } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { getPoolAddress } from "~~/services/aave/provider";
import { poolEventsAbi } from "./poolEventsAbi";
import { getSupabaseAdminClient } from "../supabase/server";
import { syncLiquidationCandidates } from "./liquidationSync";

const WATCHLIST_TABLE = "liquidation_watchlist";
const SYNC_STATE_TABLE = "liquidation_sync_state";
const DEFAULT_CHAIN_ID = 11155111;

function resolveChainId(chainId?: number) {
  return Number.isFinite(chainId ?? NaN) ? (chainId as number) : DEFAULT_CHAIN_ID;
}

function normalizeAddress(value: unknown): Address | null {
  if (typeof value !== "string" || !value) return null;
  try {
    return getAddress(value) as Address;
  } catch {
    return null;
  }
}

function getPoolDeploymentBlock(chainId: number): bigint {
  const chainContracts = deployedContracts?.[chainId as keyof typeof deployedContracts] as any;

  const poolMeta =
    chainContracts?.PoolImpl ??
    chainContracts?.Pool ??
    chainContracts?.PoolAddressesProvider ??
    chainContracts?.PoolProxy;

  const raw =
    poolMeta?.deployedOnBlock ??
    poolMeta?.deployedBlockNumber ??
    poolMeta?.blockNumber ??
    0;

  return BigInt(raw ?? 0);
}

async function getLastScannedBlock(chainId: number): Promise<bigint> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from(SYNC_STATE_TABLE)
    .select("last_scanned_block")
    .eq("chain_id", chainId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể đọc sync state: ${error.message}`);
  }

  return BigInt(data?.last_scanned_block ?? 0);
}

async function saveLastScannedBlock(chainId: number, blockNumber: bigint) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from(SYNC_STATE_TABLE).upsert(
    {
      chain_id: chainId,
      last_scanned_block: blockNumber.toString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chain_id" },
  );

  if (error) {
    throw new Error(`Không thể lưu sync state: ${error.message}`);
  }
}

function resolveSupportedChainId(
    chainId?: number,
    ): 11155111 | 1 {
    return chainId === 1 ? 1 : 11155111;
    }

    export async function backfillBorrowersFromEvents(chainId?: number) {
    const resolvedChainId = resolveChainId(chainId);
    const supportedChainId = resolveSupportedChainId(resolvedChainId);

    const publicClient = getPublicClient(wagmiConfig, {
        chainId: supportedChainId,
    });

    const poolAddress = (await getPoolAddress()) as Address;
  const lastScannedBlock = await getLastScannedBlock(resolvedChainId);
  const latestBlock = await publicClient.getBlockNumber();

  const startBlock =
    lastScannedBlock > 0n
      ? lastScannedBlock + 1n
      : getPoolDeploymentBlock(resolvedChainId);

  if (startBlock > latestBlock) {
    return {
      chainId: resolvedChainId,
      fromBlock: startBlock.toString(),
      toBlock: latestBlock.toString(),
      seeded: 0,
    };
  }

  const borrowers = new Set<Address>();

  const addAddress = (value: unknown) => {
    const normalized = normalizeAddress(value);
    if (normalized) borrowers.add(normalized);
  };

  // Backfill borrower lịch sử: Borrow, Repay, LiquidationCall
  const borrowEvents = await publicClient.getContractEvents({
    address: poolAddress,
    abi: poolEventsAbi,
    eventName: "Borrow",
    fromBlock: startBlock,
    toBlock: latestBlock,
  });

  for (const event of borrowEvents) {
    addAddress(event.args.onBehalfOf);
    addAddress(event.args.user);
  }

  const repayEvents = await publicClient.getContractEvents({
    address: poolAddress,
    abi: poolEventsAbi,
    eventName: "Repay",
    fromBlock: startBlock,
    toBlock: latestBlock,
  });

  for (const event of repayEvents) {
    addAddress(event.args.user);
  }

  const liquidationEvents = await publicClient.getContractEvents({
    address: poolAddress,
    abi: poolEventsAbi,
    eventName: "LiquidationCall",
    fromBlock: startBlock,
    toBlock: latestBlock,
  });

  for (const event of liquidationEvents) {
    addAddress(event.args.user);
  }

  const rows = [...borrowers].map(address => ({
    chain_id: resolvedChainId,
    address,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from(WATCHLIST_TABLE).upsert(rows, {
      onConflict: "chain_id,address",
    });

    if (error) {
      throw new Error(`Không thể seed watchlist: ${error.message}`);
    }
  }

  await saveLastScannedBlock(resolvedChainId, latestBlock);
  await syncLiquidationCandidates(resolvedChainId);

  return {
    chainId: resolvedChainId,
    fromBlock: startBlock.toString(),
    toBlock: latestBlock.toString(),
    seeded: rows.length,
  };
}