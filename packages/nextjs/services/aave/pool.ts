
import {writeContract,readContract,} from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";

import { poolAbi } from "./poolAbi";

import { erc20Abi } from "./erc20Abi";

import { getPoolAddress } from "./provider";
import { simulateContract } from "@wagmi/core";
/**
 * Approve ERC20 token
 */
export async function approveAsset(
  tokenAddress: `0x${string}`,
  amount: bigint,
) {
  const poolAddress = await getPoolAddress();
  return writeContract(
    wagmiConfig,
    {
      address:
        tokenAddress,

      abi:
        erc20Abi,

      functionName:
        "approve",

      args: [
        poolAddress,
        amount,
      ],
    },
  );
}

/**
 * Supply asset to Aave
 */
export async function supplyAsset(
  tokenAddress: `0x${string}`,
  amount: bigint,
  userAddress: `0x${string}`,
) {const poolAddress = await getPoolAddress();
  return writeContract(
    wagmiConfig,
    {
      address:
        poolAddress,

      abi:
        poolAbi,

      functionName:
        "supply",

      args: [
        tokenAddress,
        amount,
        userAddress,
        0,
      ],
      gas: 800000n,
    },
  );
}

/**
 * Get ERC20 allowance
 */
export async function getAssetAllowance(
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
) {const poolAddress = await getPoolAddress();
  return readContract(
    wagmiConfig,
    {
      address:
        tokenAddress,

      abi:
        erc20Abi,

      functionName:
        "allowance",

      args: [
        owner,
        poolAddress,
      ],
    },
  );
}

/**
 * Get user account data
 */
export async function getUserAccountData(
  userAddress: `0x${string}`,
) {const poolAddress = await getPoolAddress();
  return readContract(
    wagmiConfig,
    {
      address:
        poolAddress,

      abi:
        poolAbi,

      functionName:
        "getUserAccountData",

      args: [
        userAddress,
      ],
    },
  );
}



export async function getReservesList() {
  

  const poolAddress = await getPoolAddress();
  const result = await readContract(
    wagmiConfig,
    {
      address: poolAddress,
      abi: poolAbi,
      functionName: "getReservesList",
    },
  );

  return result as `0x${string}`[];
}




export async function
borrowAsset(
  tokenAddress:
    `0x${string}`,

  amount:
    bigint,

  userAddress:
    `0x${string}`,
) {const poolAddress = await getPoolAddress();
  return writeContract(
    wagmiConfig,
    {
      address:
        poolAddress,

      abi:
        poolAbi,

      functionName:
        "borrow",

      args: [
        tokenAddress,

        amount,

        /**
         * 2 = variable rate
         */
        2n,

        /**
         * referral code
         */
        0,

        userAddress,
      ],
      gas: 800000n,
    },
  );
}


export async function
withdrawAsset(
  tokenAddress:
    `0x${string}`,

  amount:
    bigint,

  userAddress:
    `0x${string}`,
) {const poolAddress = await getPoolAddress();
  return writeContract(
    wagmiConfig,
    {
      address:
        poolAddress,

      abi:
        poolAbi,

      functionName:
        "withdraw",

      args: [
        tokenAddress,

        amount,

        userAddress,
      ],
      gas: 800000n,
    },
  );
}


export async function
repayAsset(
  tokenAddress:
    `0x${string}`,

  amount:
    bigint,

  userAddress:
    `0x${string}`,
) {const poolAddress = await getPoolAddress();
  return writeContract(
    wagmiConfig,
    {
      address:
        poolAddress,

      abi:
        poolAbi,

      functionName:
        "repay",

      args: [
        tokenAddress,

        amount,

        /**
         * variable debt
         */
        2n,

        userAddress,
      ],
      gas: 800000n,
    },
  );
}

export async function setCollateralUsage(
  asset: `0x${string}`,
  useAsCollateral: boolean,
) {
  const poolAddress =
    await getPoolAddress();

  return writeContract(
    wagmiConfig,
    {
      address: poolAddress,
      abi: poolAbi,
      functionName:
        "setUserUseReserveAsCollateral",
      args: [
        asset,
        useAsCollateral,
      ],
      gas: 500000n,
    },
  );
}

export async function simulateCollateralUsage(
  asset: `0x${string}`,
  enabled: boolean,
) {
  const poolAddress =
    await getPoolAddress();

  return simulateContract(
    wagmiConfig,
    {
      address: poolAddress,
      abi: poolAbi,
      functionName:
        "setUserUseReserveAsCollateral",
      args: [
        asset,
        enabled,
      ],
    },
  );
}


