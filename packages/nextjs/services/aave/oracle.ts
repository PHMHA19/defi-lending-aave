import { readContract } from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";

import { AAVE_ORACLE } from "./addresses";

import { oracleAbi } from "./oracleAbi";

export async function getAssetPrice(
  asset: `0x${string}`,
) {
  console.log(
    "ORACLE",
    AAVE_ORACLE,
    "ASSET",
    asset
  );
  return await readContract(
    wagmiConfig,
    {
      address: AAVE_ORACLE,
      abi: oracleAbi,
      functionName: "getAssetPrice",
      args: [asset],
    },
  );
}