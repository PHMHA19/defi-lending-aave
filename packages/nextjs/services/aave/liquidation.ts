import {
  getAccount,
  getChainId,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import {
  erc20Abi,
  formatUnits,
  getAddress,
  isAddress,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { poolAbi } from "./poolAbi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { deployedContracts } from "~~/contracts/deployedContracts";

const FALLBACK_CHAIN_ID = 31337;
const HEALTH_FACTOR_DECIMALS = 18;
const BASE_CURRENCY_DECIMALS = 8;

export const MAX_UINT256: bigint = (1n << 256n) - 1n;

type DeploymentRecord = Record<string, unknown>;

export type UserAccountData = {
  totalCollateralBase: bigint;
  totalDebtBase: bigint;
  availableBorrowsBase: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
};

export type UserReserveData = {
  currentATokenBalance: bigint;
  currentStableDebt: bigint;
  currentVariableDebt: bigint;
  principalStableDebt: bigint;
  scaledVariableDebt: bigint;
  stableBorrowRate: bigint;
  liquidityRate: bigint;
  stableRateLastUpdated: bigint;
  usageAsCollateralEnabled: boolean;
};

export type LiquidationParams = {
  collateralAsset: Address;
  debtAsset: Address;
  user: Address;
  debtToCover: bigint;
  receiveAToken?: boolean;
  chainId?: number;
  autoApprove?: boolean;
  skipHealthFactorCheck?: boolean;
};

const poolDataProviderAbi = [
  {
    type: "function",
    name: "getUserReserveData",
    stateMutability: "view",
    inputs: [
      { name: "asset", type: "address" },
      { name: "user", type: "address" },
    ],
    outputs: [
      { name: "currentATokenBalance", type: "uint256" },
      { name: "currentStableDebt", type: "uint256" },
      { name: "currentVariableDebt", type: "uint256" },
      { name: "principalStableDebt", type: "uint256" },
      { name: "scaledVariableDebt", type: "uint256" },
      { name: "stableBorrowRate", type: "uint256" },
      { name: "liquidityRate", type: "uint256" },
      { name: "stableRateLastUpdated", type: "uint40" },
      { name: "usageAsCollateralEnabled", type: "bool" },
    ],
  },
] as const;

function getDeployments(): Record<string, DeploymentRecord> {
  return deployedContracts as unknown as Record<string, DeploymentRecord>;
}

function resolveChainId(chainIdOverride?: number): number {
  if (typeof chainIdOverride === "number") return chainIdOverride;

  try {
    const current = getChainId(wagmiConfig);
    if (typeof current === "number" && Number.isFinite(current)) return current;
  } catch {
    // ignore and fall back
  }

  return FALLBACK_CHAIN_ID;
}

function resolveDeployment(chainId: number): DeploymentRecord {
  const deployments = getDeployments();
  const record = deployments[String(chainId)] ?? (deployments as Record<number, DeploymentRecord>)[chainId];
  if (!record) {
    throw new Error(`Không tìm thấy deployedContracts cho chainId=${chainId}`);
  }
  return record;
}

function resolveAddress(chainId: number, keys: string[]): Address {
  const deployment = resolveDeployment(chainId);

  for (const key of keys) {
    const value = deployment[key];
    if (typeof value === "string" && isAddress(value)) {
      return getAddress(value);
    }
  }

  throw new Error(
    `Không tìm thấy địa chỉ hợp đồng trong deployedContracts cho chainId=${chainId}. ` +
      `Đã thử các key: ${keys.join(", ")}`
  );
}

function resolvePoolAddress(chainId: number): Address {
  return resolveAddress(chainId, ["pool", "Pool"]);
}

function resolveDataProviderAddress(chainId: number): Address {
  return resolveAddress(chainId, [
    "protocolDataProvider",
    "poolDataProvider",
    "aaveProtocolDataProvider",
    "dataProvider",
  ]);
}

function normalizeUserAccountData(raw: unknown): UserAccountData {
  if (Array.isArray(raw)) {
    const [
      totalCollateralBase,
      totalDebtBase,
      availableBorrowsBase,
      currentLiquidationThreshold,
      ltv,
      healthFactor,
    ] = raw as readonly [bigint, bigint, bigint, bigint, bigint, bigint];

    return {
      totalCollateralBase: BigInt(totalCollateralBase),
      totalDebtBase: BigInt(totalDebtBase),
      availableBorrowsBase: BigInt(availableBorrowsBase),
      currentLiquidationThreshold: BigInt(currentLiquidationThreshold),
      ltv: BigInt(ltv),
      healthFactor: BigInt(healthFactor),
    };
  }

  const data = raw as Partial<UserAccountData> & Record<string, unknown>;
  return {
    totalCollateralBase: BigInt((data.totalCollateralBase ?? 0n) as bigint),
    totalDebtBase: BigInt((data.totalDebtBase ?? 0n) as bigint),
    availableBorrowsBase: BigInt((data.availableBorrowsBase ?? 0n) as bigint),
    currentLiquidationThreshold: BigInt((data.currentLiquidationThreshold ?? 0n) as bigint),
    ltv: BigInt((data.ltv ?? 0n) as bigint),
    healthFactor: BigInt((data.healthFactor ?? 0n) as bigint),
  };
}

function normalizeUserReserveData(raw: unknown): UserReserveData {
  if (Array.isArray(raw)) {
    const [
      currentATokenBalance,
      currentStableDebt,
      currentVariableDebt,
      principalStableDebt,
      scaledVariableDebt,
      stableBorrowRate,
      liquidityRate,
      stableRateLastUpdated,
      usageAsCollateralEnabled,
    ] = raw as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];

    return {
      currentATokenBalance: BigInt(currentATokenBalance),
      currentStableDebt: BigInt(currentStableDebt),
      currentVariableDebt: BigInt(currentVariableDebt),
      principalStableDebt: BigInt(principalStableDebt),
      scaledVariableDebt: BigInt(scaledVariableDebt),
      stableBorrowRate: BigInt(stableBorrowRate),
      liquidityRate: BigInt(liquidityRate),
      stableRateLastUpdated: BigInt(stableRateLastUpdated),
      usageAsCollateralEnabled: Boolean(usageAsCollateralEnabled),
    };
  }

  const data = raw as Partial<UserReserveData> & Record<string, unknown>;
  return {
    currentATokenBalance: BigInt((data.currentATokenBalance ?? 0n) as bigint),
    currentStableDebt: BigInt((data.currentStableDebt ?? 0n) as bigint),
    currentVariableDebt: BigInt((data.currentVariableDebt ?? 0n) as bigint),
    principalStableDebt: BigInt((data.principalStableDebt ?? 0n) as bigint),
    scaledVariableDebt: BigInt((data.scaledVariableDebt ?? 0n) as bigint),
    stableBorrowRate: BigInt((data.stableBorrowRate ?? 0n) as bigint),
    liquidityRate: BigInt((data.liquidityRate ?? 0n) as bigint),
    stableRateLastUpdated: BigInt((data.stableRateLastUpdated ?? 0n) as bigint),
    usageAsCollateralEnabled: Boolean(data.usageAsCollateralEnabled ?? false),
  };
}

export function isLiquidatable(healthFactor: bigint): boolean {
  return healthFactor < 10n ** BigInt(HEALTH_FACTOR_DECIMALS);
}

export function formatHealthFactor(healthFactor: bigint): string {
  return Number(formatUnits(healthFactor, HEALTH_FACTOR_DECIMALS)).toFixed(4);
}

export async function getTokenDecimals(tokenAddress: Address, chainId?: number): Promise<number> {
  const resolvedChainId = resolveChainId(chainId);

  return await readContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: resolvedChainId,
  });
}

export async function parseTokenAmount(
  amount: string | number,
  tokenAddress: Address,
  chainId?: number
): Promise<bigint> {
  const decimals = await getTokenDecimals(tokenAddress, chainId);
  return parseUnits(String(amount), decimals);
}

export async function formatTokenAmount(
  amount: bigint,
  tokenAddress: Address,
  chainId?: number
): Promise<string> {
  const decimals = await getTokenDecimals(tokenAddress, chainId);
  return formatUnits(amount, decimals);
}

export async function getUserAccountData(
  userAddress: Address,
  chainId?: number
): Promise<UserAccountData> {
  const resolvedChainId = resolveChainId(chainId);
  const poolAddress = resolvePoolAddress(resolvedChainId);

  const raw = await readContract(wagmiConfig, {
    address: poolAddress,
    abi: poolAbi,
    functionName: "getUserAccountData",
    args: [getAddress(userAddress)],
    chainId: resolvedChainId,
  });

  return normalizeUserAccountData(raw);
}

export async function getUserReserveData(
  asset: Address,
  user: Address,
  chainId?: number
): Promise<UserReserveData> {
  const resolvedChainId = resolveChainId(chainId);
  const dataProviderAddress = resolveDataProviderAddress(resolvedChainId);

  const raw = await readContract(wagmiConfig, {
    address: dataProviderAddress,
    abi: poolDataProviderAbi,
    functionName: "getUserReserveData",
    args: [getAddress(asset), getAddress(user)],
    chainId: resolvedChainId,
  });

  return normalizeUserReserveData(raw);
}

export async function getAllowance(
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address,
  chainId?: number
): Promise<bigint> {
  const resolvedChainId = resolveChainId(chainId);

  return await readContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [getAddress(ownerAddress), getAddress(spenderAddress)],
    chainId: resolvedChainId,
  });
}

export async function approveAsset(
  tokenAddress: Address,
  amount: bigint,
  spenderAddress?: Address,
  chainId?: number
): Promise<Hex> {
  const resolvedChainId = resolveChainId(chainId);
  const spender = spenderAddress ?? resolvePoolAddress(resolvedChainId);
  const account = getAccount(wagmiConfig);

  if (!account.address) {
    throw new Error("Chưa kết nối ví. Hãy connect wallet trước khi approve.");
  }

  const owner = getAddress(account.address);
  const allowance = await getAllowance(tokenAddress, owner, spender, resolvedChainId);

  if (allowance >= amount) {
    return "0x" as Hex;
  }

  return await writeContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
    chainId: resolvedChainId,
  });
}

export async function liquidationCallRaw(
  collateralAsset: Address,
  debtAsset: Address,
  user: Address,
  debtToCover: bigint,
  receiveAToken: boolean = false,
  chainId?: number
): Promise<Hex> {
  const resolvedChainId = resolveChainId(chainId);
  const poolAddress = resolvePoolAddress(resolvedChainId);

  return await writeContract(wagmiConfig, {
    address: poolAddress,
    abi: poolAbi,
    functionName: "liquidationCall",
    args: [
      getAddress(collateralAsset),
      getAddress(debtAsset),
      getAddress(user),
      debtToCover,
      receiveAToken,
    ],
    chainId: resolvedChainId,
  });
}

export async function liquidationCall(params: LiquidationParams): Promise<Hex> {
  const resolvedChainId = resolveChainId(params.chainId);
  const poolAddress = resolvePoolAddress(resolvedChainId);

  if (params.debtToCover <= 0n) {
    throw new Error("Số tiền thanh lý phải lớn hơn 0.");
  }

  const accountData = await getUserAccountData(params.user, resolvedChainId);
  if (!params.skipHealthFactorCheck && !isLiquidatable(accountData.healthFactor)) {
    throw new Error(
      `Vị thế chưa đủ điều kiện thanh lý. Health Factor hiện tại = ${formatHealthFactor(
        accountData.healthFactor
      )} (phải < 1.0000).`
    );
  }

  if (params.autoApprove !== false) {
    const approveHash = await approveAsset(
      params.debtAsset,
      params.debtToCover,
      poolAddress,
      resolvedChainId
    );

    if (approveHash !== "0x") {
      await waitForTransactionReceipt(wagmiConfig, {
        hash: approveHash,
        chainId: resolvedChainId,
      });
    }
  }

  return await liquidationCallRaw(
    params.collateralAsset,
    params.debtAsset,
    params.user,
    params.debtToCover,
    params.receiveAToken ?? false,
    resolvedChainId
  );
}

export async function liquidationCallAndWait(params: LiquidationParams) {
  const resolvedChainId = resolveChainId(params.chainId);
  const hash = await liquidationCall(params);

  return await waitForTransactionReceipt(wagmiConfig, {
    hash,
    chainId: resolvedChainId,
  });
}

export async function getLiquidationPreview(
  userAddress: Address,
  chainId?: number
): Promise<{
  chainId: number;
  accountData: UserAccountData;
  isLiquidatable: boolean;
  healthFactor: string;
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
}> {
  const resolvedChainId = resolveChainId(chainId);
  const accountData = await getUserAccountData(userAddress, resolvedChainId);

  return {
    chainId: resolvedChainId,
    accountData,
    isLiquidatable: isLiquidatable(accountData.healthFactor),
    healthFactor: formatHealthFactor(accountData.healthFactor),
    totalCollateralBase: formatUnits(accountData.totalCollateralBase, BASE_CURRENCY_DECIMALS),
    totalDebtBase: formatUnits(accountData.totalDebtBase, BASE_CURRENCY_DECIMALS),
    availableBorrowsBase: formatUnits(accountData.availableBorrowsBase, BASE_CURRENCY_DECIMALS),
  };
}