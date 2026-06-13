import {
  readContract,
} from "@wagmi/core";

import {
  wagmiConfig,
} from "~~/services/web3/wagmiConfig";

import {
  erc20Abi,
} from "./erc20Abi";


import type {
  WalletBalance,
} from "~~/types/aave";

import {
  getReservesList,
} from "./pool";


export type TokenMetadata =
  {
    address: `0x${string}`;

    symbol: string;

    name: string;

    decimals: number;
  };

export async function getTokenMetadata(
  tokenAddress: `0x${string}`,
): Promise<TokenMetadata> {
  const [
    symbol,
    name,
    decimals,
  ] = await Promise.all([
    readContract(
      wagmiConfig,
      {
        address:
          tokenAddress,

        abi:
          erc20Abi,

        functionName:
          "symbol",
      },
    ),

    readContract(
      wagmiConfig,
      {
        address:
          tokenAddress,

        abi:
          erc20Abi,

        functionName:
          "name",
      },
    ),

    readContract(
      wagmiConfig,
      {
        address:
          tokenAddress,

        abi:
          erc20Abi,

        functionName:
          "decimals",
      },
    ),
  ]);

  return {
    address:
      tokenAddress,

    symbol,

    name,

    decimals:
      Number(decimals),
  };
}


export async function
getTokenBalance(
  tokenAddress:
    `0x${string}`,

  user:
    `0x${string}`,
) {
  return await readContract(
    wagmiConfig,
    {
      address:
        tokenAddress,

      abi:
        erc20Abi,

      functionName:
        "balanceOf",

      args: [user],
    },
  );
}


export async function
getWalletBalances(
  user:
    `0x${string}`,
): Promise<
  WalletBalance[]
> {

  /**
   * Load reserve assets
   */
  const reserveAddresses =
    await getReservesList();
  console.log(
    "RESERVES:",
    reserveAddresses,
  );
  /**
   * Limit reserves
   * for localhost performance
   */
  const limitedReserves =
    reserveAddresses.slice(
      0,
      2,
    );

  const balances =
    await Promise.all(
      limitedReserves.map(
        async asset => {

          /**
           * Load metadata
           */
          const metadata =
            await getTokenMetadata(
              asset,
            );

          /**
           * Load balance
           */
          const balance =
            await getTokenBalance(
              asset,
              user,
            );
          
          console.log(
            "TOKEN:",
            metadata.symbol,
            asset,
            balance.toString(),
          );

          return {
            asset,

            symbol:
              metadata.symbol,

            decimals:
              metadata.decimals,

            balance,
          };
        },
      ),
    );

  const filteredBalances =
    balances.filter(
      balance =>
        balance.balance > 0n,
    );

  return filteredBalances;
}

