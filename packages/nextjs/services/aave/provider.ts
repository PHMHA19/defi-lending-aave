import { readContract } from "@wagmi/core";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

import { AAVE_POOL_ADDRESSES_PROVIDER } from "./addresses";

const providerAbi = [
  {
    inputs: [],
    name: "getPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export async function getPoolAddress() {
  return await readContract(
    wagmiConfig,
    {
      address: AAVE_POOL_ADDRESSES_PROVIDER,
      abi: providerAbi,
      functionName: "getPool",
    },
  );
}