
import {
  readContract,
} from "@wagmi/core";

import {
  wagmiConfig,
} from "~~/services/web3/wagmiConfig";

import {
  AAVE_POOL_DATA_PROVIDER,
} from "./addresses";

import {
  poolDataProviderAbi,
} from "./poolDataProviderAbi";




import type {
  ReserveData,
  RawReserveData,
  ReserveConfigurationData,
  RawUserReserveData,
  UserReserveData,
} from "~~/types/aave";






import {
  getReservesList,
} from "./pool";

import {
  getTokenMetadata,
} from "./token";

import {
  getAssetPrice,
} from "./oracle";


export async function getReserveData(
  asset: `0x${string}`,
) {
  return await readContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL_DATA_PROVIDER,

      abi:
        poolDataProviderAbi,

      functionName:
        "getReserveData",

      args: [asset],
    },
  );
}





export async function getReserveConfigurationData(
  asset: `0x${string}`,
) {
  return await readContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL_DATA_PROVIDER,

      abi:
        poolDataProviderAbi,

      functionName:
        "getReserveConfigurationData",

      args: [asset],
    },
  );
}


export async function getUserReserveData(
  asset: `0x${string}`,

  user:
    `0x${string}`,
) {
  return await readContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL_DATA_PROVIDER,

      abi:
        poolDataProviderAbi,

      functionName:
        "getUserReserveData",

      args: [
        asset,
        user,
      ],
    },
  );
}



function mapReserveData(
  reserve: {
    symbol: string;

    address: `0x${string}`;

    decimals: number;
  },

  reserveData: any,

  configData: any,
  price: bigint,
): ReserveData {

  const normalizedReserveData:
    RawReserveData = {
    unbacked:
      reserveData[0],

    accruedToTreasuryScaled:
      reserveData[1],

    totalAToken:
      reserveData[2],

    totalStableDebt:
      reserveData[3],

    totalVariableDebt:
      reserveData[4],

    liquidityRate:
      reserveData[5],

    variableBorrowRate:
      reserveData[6],

    stableBorrowRate:
      reserveData[7],

    averageStableBorrowRate:
      reserveData[8],

    liquidityIndex:
      reserveData[9],

    variableBorrowIndex:
      reserveData[10],

    lastUpdateTimestamp:
      reserveData[11],
  };

  const normalizedConfigData:
    ReserveConfigurationData = {
    decimals:
      configData[0],

    ltv:
      configData[1],

    liquidationThreshold:
      configData[2],

    liquidationBonus:
      configData[3],

    reserveFactor:
      configData[4],

    usageAsCollateralEnabled:
      configData[5],

    borrowingEnabled:
      configData[6],

    stableBorrowRateEnabled:
      configData[7],

    isActive:
      configData[8],

    isFrozen:
      configData[9],
  };

  return {
    symbol:
      reserve.symbol,

    asset:
      reserve.address,

    price:
      price,

    decimals:
      reserve.decimals,

    liquidityRate:
      normalizedReserveData
        .liquidityRate,

    variableBorrowRate:
      normalizedReserveData
        .variableBorrowRate,

    liquidity:
      normalizedReserveData
        .totalAToken,

    ltv:
      normalizedConfigData
        .ltv,

    liquidationThreshold:
      normalizedConfigData
        .liquidationThreshold,

    liquidationBonus: normalizedConfigData.liquidationBonus,

    reserveFactor:
      normalizedConfigData
        .reserveFactor,

    usageAsCollateralEnabled:
      normalizedConfigData
        .usageAsCollateralEnabled,

    borrowingEnabled:
      normalizedConfigData
        .borrowingEnabled,

    isActive:
      normalizedConfigData
        .isActive,

    isFrozen:
      normalizedConfigData
        .isFrozen,
  };
}



function mapUserReserveData(
  reserve: {
    symbol: string;

    address: `0x${string}`;

    decimals: number;
  },

  userReserveData: any,
): UserReserveData {

  const normalizedUserReserveData:
    RawUserReserveData = {
    currentATokenBalance:
      userReserveData[0],

    currentStableDebt:
      userReserveData[1],

    currentVariableDebt:
      userReserveData[2],

    principalStableDebt:
      userReserveData[3],

    scaledVariableDebt:
      userReserveData[4],

    stableBorrowRate:
      userReserveData[5],

    liquidityRate:
      userReserveData[6],

    stableRateLastUpdated:
      userReserveData[7],

    usageAsCollateralEnabled:
      userReserveData[8],
  };

  return {
    asset:
      reserve.address,

    symbol:
      reserve.symbol,

    decimals:
      reserve.decimals,

    supplied:
      normalizedUserReserveData
        .currentATokenBalance,

    stableDebt:
      normalizedUserReserveData
        .currentStableDebt,

    variableDebt:
      normalizedUserReserveData
        .currentVariableDebt,

    usageAsCollateralEnabled:
      normalizedUserReserveData
        .usageAsCollateralEnabled,
  };
}





export async function getAllReserveData() {
  /**
   * Load all reserve addresses
   * directly from Aave Pool
   */
  const reserveAddresses =
    await getReservesList();

  // console.log(
  //   "RESERVES FROM POOL",
  //   reserveAddresses
  // );

  /**
   * Limit reserves for localhost performance
   */
  return Promise.all(
  reserveAddresses.map(
      async asset => {
        /**
         * Load token metadata
         */
        const metadata =
          await getTokenMetadata(
            asset,
          );

        /**
         * Load reserve data
         */
        const data =
          await getReserveData(
            asset,
          );
        
        const configData =
          await getReserveConfigurationData(
            asset,
          );

          
        const price =
          await getAssetPrice(asset);

        console.log(
          "PRICE:",
          metadata.symbol,
          price.toString(),
        );
        
      const reserve =
        mapReserveData(
          {
            symbol: metadata.symbol,
            address: asset,
            decimals: metadata.decimals,
          },
          data,
          configData,
          price,
        );

      return reserve;

      },
    ),
  );
}


export async function
getUserPositions(
  user:
    `0x${string}`,
) {
  /**
   * Load all reserves
   */
  const reserveAddresses =
    await getReservesList();

  /**
   * Limit reserves
   * for localhost performance
   */
  const positions =
  await Promise.all(
    reserveAddresses.map(

      async asset => {
        /**
         * Load token metadata
         */
        const metadata =
          await getTokenMetadata(
            asset,
          );

        /**
         * Load user reserve data
         */
        const userReserveData =
          await getUserReserveData(
            asset,
            user,
          );

        const position =
          mapUserReserveData(
            {
              symbol:
                metadata.symbol,

              address:
                asset,

              decimals:
                metadata.decimals,
            },

            userReserveData,
          );

        const hasSupply =
          position.supplied > 0n;

        const hasDebt =
          position.variableDebt > 0n ||
          position.stableDebt > 0n;

        if (
          hasSupply ||
          hasDebt
        ) {
          return position;
        }

        return null;

      }, ), );

return positions.filter(
  Boolean,
) as UserReserveData[];

}

