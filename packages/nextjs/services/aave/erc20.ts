import { writeContract, readContract } from "@wagmi/core";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

import { erc20Abi } from "./erc20Abi";
import { TOKENS, getPoolAddress } from "./addresses";

export async function approveUSDC(amount: bigint) {
  const poolAddress = await getPoolAddress();

  return writeContract(wagmiConfig, {
    address: TOKENS.USDC,
    abi: erc20Abi,
    functionName: "approve",
    args: [poolAddress, amount],
  });
}

export async function getUSDCBalance(user: `0x${string}`) {
  return readContract(wagmiConfig, {
    address: TOKENS.USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [user],
  });
}

export async function getUSDCAllowance(
  owner: `0x${string}`,
  spender: `0x${string}`,
) {
  return readContract(wagmiConfig, {
    address: TOKENS.USDC,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
  });
}