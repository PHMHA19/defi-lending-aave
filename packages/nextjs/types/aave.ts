

export type ReserveData = {
  symbol: string;

  asset: `0x${string}`;
  
  price: bigint;
  
  decimals: number;

  liquidityRate: bigint;

  variableBorrowRate: bigint;

  liquidity: bigint;

  ltv: bigint;

  liquidationThreshold: bigint;

  liquidationBonus: bigint;
  
  reserveFactor: bigint;

  usageAsCollateralEnabled: boolean;

  borrowingEnabled: boolean;

  isActive: boolean;

  isFrozen: boolean;
  
};


export type RawReserveData = {
  unbacked: bigint;

  accruedToTreasuryScaled:
    bigint;

  totalAToken: bigint;

  totalStableDebt: bigint;

  totalVariableDebt: bigint;

  liquidityRate: bigint;

  variableBorrowRate: bigint;

  stableBorrowRate: bigint;

  averageStableBorrowRate:
    bigint;

  liquidityIndex: bigint;

  variableBorrowIndex:
    bigint;

  lastUpdateTimestamp:
    bigint;
};

export type ReserveConfigurationData =
  {
    decimals: bigint;

    ltv: bigint;

    liquidationThreshold:
      bigint;

    liquidationBonus:
      bigint;

    reserveFactor: bigint;

    usageAsCollateralEnabled:
      boolean;

    borrowingEnabled:
      boolean;

    stableBorrowRateEnabled:
      boolean;

    isActive: boolean;

    isFrozen: boolean;
  };


export type UserAccountData = {
  totalCollateral: string;

  totalDebt: string;

  availableBorrows: string;

  ltv: string;

  healthFactor: string;
};


export type RawUserReserveData = {
  currentATokenBalance:
    bigint;

  currentStableDebt:
    bigint;

  currentVariableDebt:
    bigint;

  principalStableDebt:
    bigint;

  scaledVariableDebt:
    bigint;

  stableBorrowRate:
    bigint;

  liquidityRate:
    bigint;

  stableRateLastUpdated:
    bigint;

  usageAsCollateralEnabled:
    boolean;
};

export type UserReserveData = {
  asset:
    `0x${string}`;

  symbol:
    string;

  decimals:
    number;

  supplied:
    bigint;

  stableDebt:
    bigint;

  variableDebt:
    bigint;

  usageAsCollateralEnabled:
    boolean;
};


export type WalletBalance = {
  asset:
    `0x${string}`;

  symbol:
    string;

  decimals:
    number;

  balance:
    bigint;
};

