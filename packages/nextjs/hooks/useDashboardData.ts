"use client";

import { formatUnits, zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type UserAccountData = readonly [
  bigint, // totalCollateralBase
  bigint, // totalDebtBase
  bigint, // availableBorrowsBase
  bigint, // currentLiquidationThreshold
  bigint, // ltv
  bigint, // healthFactor
];

export const useDashboardData = () => {
  const { address } = useAccount();

  const safeAddress = address || zeroAddress;

  const { data: accountData } = useScaffoldReadContract({
    contractName: "LendingPool",
    functionName: "getUserAccountData",
    args: [safeAddress],
  }) as {
    data: UserAccountData | undefined;
  };


  return {
    supplied: accountData
      ? Number(formatUnits(accountData[0], 6))
      : 0,

    borrowed: accountData
      ? Number(formatUnits(accountData[1], 6))
      : 0,

    availableBorrow: accountData
      ? Number(formatUnits(accountData[2], 6))
      : 0,

    ltv: accountData
      ? Number(accountData[4]) / 100
      : 0,

    healthFactor: accountData
      ? Number(formatUnits(accountData[5], 18))
      : 0,
  };
};
