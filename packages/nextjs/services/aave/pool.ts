
import {writeContract,readContract,} from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";

import { poolAbi } from "./poolAbi";

import { erc20Abi } from "./erc20Abi";

import {AAVE_POOL,} from "./addresses";
import { getPublicClient } from "@wagmi/core";
/**
 * Approve ERC20 token
 */
export async function approveAsset(
  tokenAddress: `0x${string}`,
  amount: bigint,
) {
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
        AAVE_POOL,
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
) {
  return writeContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL,

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
    },
  );
}

/**
 * Get ERC20 allowance
 */
export async function getAssetAllowance(
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
) {
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
        AAVE_POOL,
      ],
    },
  );
}

/**
 * Get user account data
 */
export async function getUserAccountData(
  userAddress: `0x${string}`,
) {
  return readContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL,

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
  const client = getPublicClient(wagmiConfig);

  // console.log(
  //   "USING POOL",
  //   AAVE_POOL
  // );

  const result = await readContract(
    wagmiConfig,
    {
      address: AAVE_POOL,
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
) {
  return writeContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL,

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
) {
  return writeContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL,

      abi:
        poolAbi,

      functionName:
        "withdraw",

      args: [
        tokenAddress,

        amount,

        userAddress,
      ],
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
) {
  return writeContract(
    wagmiConfig,
    {
      address:
        AAVE_POOL,

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
    },
  );
}





