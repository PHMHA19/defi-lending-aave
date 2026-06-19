
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useAccount,
  useChainId,
} from "wagmi";

import { writeContract } from "@wagmi/core";
import {
  waitForTransactionReceipt,
} from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";

import {
  getReservesList,
} from "~~/services/aave/pool";

import {
  approveAsset,
  borrowAsset,
  repayAsset,
  withdrawAsset,
  getAssetAllowance,
  getUserAccountData,
  supplyAsset,
  setCollateralUsage,
  simulateCollateralUsage,
} from "~~/services/aave/pool";

import {
  getAllReserveData,
} from "~~/services/aave/reserve";

import type {
  ReserveData,
  UserAccountData,
} from "~~/types/aave";


import {
  getWalletBalances,
} from "~~/services/aave/token";

import type {
  WalletBalance,
} from "~~/types/aave";


import {
  formatHealthFactor,
  formatLTV,
  formatUSD,
} from "~~/utils/aaveFormat";


import {
  getUserPositions,
} from "~~/services/aave/reserve";

import type {
  UserReserveData,
} from "~~/types/aave";


import {
  DashboardHeader,
} from "~~/components/aave/DashboardHeader";


import {
  AccountOverview,
} from "~~/components/aave/AccountOverview";


import {
  ActionPanel,
} from "~~/components/aave/ActionPanel";


import {
  SupplyCard,
} from "~~/components/aave/SupplyCard";

import {
  BorrowCard,
} from "~~/components/aave/BorrowCard";


import {
  WithdrawCard,
} from "~~/components/aave/WithdrawCard";


import {
  RepayCard,
} from "~~/components/aave/RepayCard";

import {
  MarketsTable,
} from "~~/components/aave/MarketsTable";

import {
  PositionsTable,
} from "~~/components/aave/PositionsTable";

import {
  WalletBalancesTable,
} from "~~/components/aave/WalletBalancesTable";

const faucetAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "value",
        type: "uint256",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
] as const;


export default function TestPage() {
  const {
    address,
  } = useAccount();
  const chainId = useChainId();
    async function refreshLiquidationCandidates() {
    try {
      await fetch(`/api/liquidation-candidates?chainId=${chainId}&refresh=1`, {
        cache: "no-store",
      });
    } catch (error) {
      console.error("Failed to refresh liquidation candidates", error);
    }
  }

  const handleFaucetUSDC = async () => {
    try {
      const reserves =
        await getReservesList();

      const usdc =
        reserves[0];

      const hash =
        await writeContract(
          wagmiConfig,
          {
            address: usdc,
            abi: faucetAbi,
            functionName: "mint",
            args: [
              10000n *
              10n ** 6n,
            ],
          },
        );

      const receipt =
        await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash,
          },
        );

      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "Mint failed",
        );
      }

      alert(
        "Minted 10,000 mUSDC",
      );

      await loadReserves();

    } catch (err) {
      console.error(err);
    }
  };

const handleFaucetWETH = async () => {
  try {
    const reserves =
      await getReservesList();

    const weth =
      reserves[1];

    const hash =
      await writeContract(
        wagmiConfig,
        {
          address: weth,
          abi: faucetAbi,
          functionName: "mint",
          args: [
            10n *
            10n ** 18n,
          ],
        },
      );

    const receipt =
      await waitForTransactionReceipt(
        wagmiConfig,
        {
          hash,
        },
      );

    if (
      receipt.status !==
      "success"
    ) {
      throw new Error(
        "Mint failed",
      );
    }

    alert(
      "Minted 10 WETH",
    );

    await loadReserves();

  } catch (err) {
    console.error(err);
  }
};

  const [loading, setLoading] =
    useState(false);

  const [
    accountData,
    setAccountData,
  ] =
    useState<UserAccountData | null>(
      null,
    );

  const [
    reserves,
    setReserves,
  ] = useState<
    ReserveData[]
  >([]);

 
  const [
    userPositions,

    setUserPositions,
  ] = useState<
    UserReserveData[]
  >([]);


const [
  walletBalances,

  setWalletBalances,
] = useState<
  WalletBalance[]
>([]);


const [
  selectedAsset,

  setSelectedAsset,
] = useState<
  `0x${string}` |
  ""
>("");

const [
  supplyAmount,

  setSupplyAmount,
] = useState("");


const [
  borrowAmount,

  setBorrowAmount,
] = useState("");

const [
  borrowAssetAddress,

  setBorrowAssetAddress,
] = useState<
  `0x${string}` |
  ""
>("");


const [
  withdrawAmount,

  setWithdrawAmount,
] = useState("");

const [
  withdrawAssetAddress,

  setWithdrawAssetAddress,
] = useState<
  `0x${string}` |
  ""
>("");

const [
  repayAmount,

  setRepayAmount,
] = useState("");

const [
  repayAssetAddress,

  setRepayAssetAddress,
] = useState<
  `0x${string}` |
  ""
>("");



  useEffect(() => {
    if (address) {
      loadReserves();
      loadAccountData();
    }
  }, [address]);

  async function loadReserves() {
    try {
      const data =
        await getAllReserveData();

      setReserves(data);

      if (address) {
        const positions =
          await getUserPositions(
            address as `0x${string}`,
          );
        setUserPositions(
          positions,
        );
      
        const balances =
          await getWalletBalances(
            address as `0x${string}`,
          );

        setWalletBalances(
          balances,
        );
      }

    } catch (err) {
      console.error(err);
    }
  }

  async function loadAccountData() {
    if (!address) {
      return;
    }

    try {
      const data =
        await getUserAccountData(
          address as `0x${string}`,
        );
     
      const formattedData: UserAccountData =
        {
          totalCollateral:
            formatUSD(
              data[0],
            ),

          totalDebt:
            formatUSD(
              data[1],
            ),

          availableBorrows:
            formatUSD(
              data[2],
            ),

          ltv:
            formatLTV(
              data[4],
            ),

          healthFactor:
            formatHealthFactor(
              data[5],
            ),
        };

      setAccountData(
        formattedData,
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSupply() {
    if (!address) {
      return;
    }

    const userAddress =
      address as `0x${string}`;

    try {
      setLoading(true);

      /**
       * 100 USDC
       */
      
      if (
        !selectedAsset ||
        !supplyAmount
      ) {
        return;
      }

      const selectedBalance =
        walletBalances.find(
          balance =>
            balance.asset ===
            selectedAsset,
        );

      if (
        !selectedBalance
      ) {
        return;
      }

      const parsedAmount =
        Number(
          supplyAmount,
        );
      if ( Number.isNaN( parsedAmount, ) || parsedAmount <= 0 ) { alert( "Invalid amount", ); return; }
      
      
      const amount =
        BigInt(
          Math.floor(
            parsedAmount *
            10 **
              selectedBalance.decimals,
          ),
        );
      if ( amount > selectedBalance.balance ) { alert( "Insufficient balance", ); return; }
      
      const allowance = 
        await getAssetAllowance( 
          selectedAsset, 
          userAddress, 
        ); 
      if ( allowance < amount 
      ) {

      /**
       * Approve
       */
      const approveHash =
        await approveAsset(
          selectedAsset,
          amount,
        );

      const approveReceipt =
        await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash: approveHash,
          },
        );

      if (
        approveReceipt.status !==
        "success"
      ) {
        throw new Error(
          "Approve failed",
        );
      }
      

      console.log(
        "Approve success",
      );}

      /**
       * Supply
       */
      const hash =
        await supplyAsset(
          selectedAsset,
          amount,
          userAddress,
        );

      const receipt =
        await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash,
          },
        );

        console.log(
          "SUPPLY RECEIPT",
          receipt,
        );


      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "Supply failed",
        );
      }

      console.log(
        "Supply success",
      );

      /**
       * Reload account data
       */
      await loadAccountData();
      await loadReserves();
      await refreshLiquidationCandidates();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  const handleBorrow =
    async () => {

    if (
      !borrowAssetAddress ||
      !borrowAmount ||
      !address
    ) {
      return;
    }

    const selectedReserve =
      reserves.find(
        reserve =>
          reserve.asset ===
          borrowAssetAddress,
      );

    if (
      !selectedReserve
    ) {
      return;
    }

    const parsedAmount =
      Number(
        borrowAmount,
      );

    if (
      Number.isNaN(
        parsedAmount,
      ) ||
      parsedAmount <= 0
    ) {
      alert(
        "Invalid borrow amount",
      );

      return;
    }

    const amount =
      BigInt(
        Math.floor(
          parsedAmount *
          10 **
            selectedReserve.decimals,
        ),
      );
    
    if (
      !accountData
    ) {
      return;
    }

    const assetPrice =
      Number(
        selectedReserve.price,
      ) / 1e8;

    if (
      Number.isNaN(assetPrice) ||
      assetPrice <= 0
    ) {
      alert(
        "Invalid asset price",
      );

      return;
    }

    const borrowValueUsd =
      parsedAmount *
      assetPrice;


    const availableBorrows =
      Number(
        accountData
          .availableBorrows,
      );

    if (
      borrowValueUsd  >
      availableBorrows
    ) {
      alert(
      `Borrow exceeds limit.
  Requested: $${borrowValueUsd.toFixed(2)}
  Available: $${availableBorrows.toFixed(2)}`
  );

      return;
    }
   

    try {
      const hash =
        await borrowAsset(
          borrowAssetAddress,
          amount,
          address as `0x${string}`,
        );

      const receipt =
        await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash,
          },
        );

      console.log(
        "BORROW RECEIPT",
        receipt,
      );

      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "Borrow failed",
        );
      }

      alert(
        "Borrow success",
      );

        const syncResponse = await fetch("/api/liquidation-watchlist", {
        method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            chainId,
            action: "add",
          }),
        });

        if (!syncResponse.ok) {
          console.error("Failed to add borrower to watchlist");
        }

        await loadAccountData();
        await loadReserves();
        await refreshLiquidationCandidates();

    } catch (
      error
    ) {
      console.error(
        error,
      );

      alert(
        "Borrow failed",
      );
    }
  };


  const handleWithdraw =
    async () => {

    if (
      !withdrawAssetAddress ||
      !withdrawAmount ||
      !address
    ) {
      return;
    }

    const position =
      userPositions.find(
        position =>
          position.asset ===
          withdrawAssetAddress,
      );

    if (
      !position
    ) {
      return;
    }

    const parsedAmount =
      Number(
        withdrawAmount,
      );

    if (
      Number.isNaN(
        parsedAmount,
      ) ||
      parsedAmount <= 0
    ) {
      alert(
        "Invalid withdraw amount",
      );

      return;
    }

    const amount =
      BigInt(
        Math.floor(
          parsedAmount *
          10 **
            position.decimals,
        ),
      );

    if (
      amount >
      position.supplied
    ) {
      alert(
        "Withdraw amount exceeds supplied balance",
      );

      return;
    }

    try {
      const hash =
        await withdrawAsset(
          withdrawAssetAddress,
          amount,
          address as `0x${string}`,
        );

      const receipt =
        await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash,
          },
        );

      console.log(
        "WITHDRAW RECEIPT",
        receipt,
      );

      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "Withdraw failed",
        );
      }

      alert(
        "Withdraw success",
      );

      await loadAccountData();

      await loadReserves();
      await refreshLiquidationCandidates();

    } catch (
      error
    ) {
      console.error(
        error,
      );

      alert(
        "Withdraw failed",
      );
    }
  };

  const handleToggleCollateral = async (
    asset: `0x${string}`,
    enabled: boolean,
  ) => {
    try {

      // simulate trước
      await simulateCollateralUsage(
        asset,
        enabled,
      );

      // chỉ khi simulate pass mới mở MetaMask
      const hash =
        await setCollateralUsage(
          asset,
          enabled,
        );

      await waitForTransactionReceipt(
        wagmiConfig,
        { hash },
      );

      await loadAccountData();
      await loadReserves();
      await refreshLiquidationCandidates();

    } catch (error: any) {
      console.error(error);

      alert(
        enabled
          ? "Không thể bật collateral."
          : "Không thể tắt collateral vì tài sản này đang bảo đảm cho khoản vay hiện tại."
      );
    }
  };

  
  const handleRepay =
    async () => {

    if (
      !repayAssetAddress ||
      !repayAmount ||
      !address
    ) {
      return;
    }

    const position =
      userPositions.find(
        position =>
          position.asset ===
          repayAssetAddress,
      );

    if (
      !position
    ) {
      return;
    }


    const walletBalance =
      walletBalances.find(
        balance =>
          balance.asset ===
          repayAssetAddress,
      );

    if (
      !walletBalance
    ) {
      return;
    }

    const parsedAmount =
      Number(
        repayAmount,
      );

    if (
      Number.isNaN(
        parsedAmount,
      ) ||
      parsedAmount <= 0
    ) {
      alert(
        "Invalid repay amount",
      );

      return;
    }

    const amount =
      BigInt(
        Math.floor(
          parsedAmount *
          10 **
            position.decimals,
        ),
      );

    if (
      amount >
      position.variableDebt
    ) {
      alert(
        "Repay amount exceeds debt",
      );

      return;
    }

    if (
      amount >
      walletBalance.balance
    ) {
      alert(
        "Insufficient wallet balance",
      );

      return;
    }

    try {

      const allowance =
        await getAssetAllowance(
          repayAssetAddress,

          address as `0x${string}`,
        );

      if (
        allowance < amount
      ) {

        const approveHash =
          await approveAsset(
            repayAssetAddress,
            amount,
          );

        const approveReceipt =
          await waitForTransactionReceipt(
            wagmiConfig,
            {
              hash: approveHash,
            },
          );

        if (
          approveReceipt.status !==
          "success"
        ) {
          throw new Error(
            "Approve failed",
          );
          }
      }

      const hash =
        await repayAsset(
          repayAssetAddress,
          amount,
          address as `0x${string}`,
        );

      const receipt =
        await waitForTransactionReceipt(
          wagmiConfig,
          {
            hash,
          },
        );
      
      console.log(
        "REPAY RECEIPT",
        receipt,
      );

      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "Repay failed",
        );
      }

      alert(
        "Repay success",
      );

      await loadAccountData();
      await loadReserves();

      /*
      * Nếu user đã hết nợ thì xóa khỏi watchlist
      */
      const refreshedPositions =
        await getUserPositions(
          address as `0x${string}`,
        );

      const stillHasDebt =
        refreshedPositions.some(
          p =>
            p.variableDebt > 0n ||
            p.stableDebt > 0n,
        );

      if (!stillHasDebt) {
        const syncResponse = await fetch("/api/liquidation-watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            chainId,
            action: "remove",
          }),
        });

        if (!syncResponse.ok) {
          console.error("Failed to remove borrower from shared watchlist");
        }
      }

      await refreshLiquidationCandidates();

    } catch (
      error
    ) {
      console.error(
        error,
      );

      alert(
        "Repay failed",
      );
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      <div className="max-w-7xl mx-auto p-8 space-y-8 relative z-10 space-y-8">

        <DashboardHeader />
    
        <AccountOverview
          accountData={
            accountData
          }
        />
      <ActionPanel>
      <SupplyCard
        selectedAsset={
          selectedAsset
        }

        setSelectedAsset={
          setSelectedAsset
        }

        supplyAmount={
          supplyAmount
        }

        setSupplyAmount={
          setSupplyAmount
        }

        walletBalances={
          walletBalances
        }

        handleSupply={
          handleSupply
        }

        loading={
          loading
        }

     
        address={
          address as
            `0x${string}` |
            undefined
        }

      />
      
      <BorrowCard
        borrowAssetAddress={
          borrowAssetAddress
        }

        setBorrowAssetAddress={
          setBorrowAssetAddress
        }

        borrowAmount={
          borrowAmount
        }

        setBorrowAmount={
          setBorrowAmount
        }

        reserves={
          reserves
        }

        handleBorrow={
          handleBorrow
        }

        address={
          address as
            `0x${string}` |
            undefined
        }
      />
    
      <WithdrawCard
        withdrawAssetAddress={
          withdrawAssetAddress
        }

        setWithdrawAssetAddress={
          setWithdrawAssetAddress
        }

        withdrawAmount={
          withdrawAmount
        }

        setWithdrawAmount={
          setWithdrawAmount
        }

        userPositions={
          userPositions
        }

        handleWithdraw={
          handleWithdraw
        }

        address={
          address as
            `0x${string}` |
            undefined
        }
      />
     
      <RepayCard
        repayAssetAddress={
          repayAssetAddress
        }

        setRepayAssetAddress={
          setRepayAssetAddress
        }

        repayAmount={
          repayAmount
        }

        setRepayAmount={
          setRepayAmount
        }

        userPositions={
          userPositions
        }

        handleRepay={
          handleRepay
        }

        address={
          address as
            `0x${string}` |
            undefined
        }
      />

      
      </ActionPanel>

      <div className="flex gap-4">
        <button
          className="btn btn-primary"
          onClick={handleFaucetUSDC}
        >
          Faucet 10,000 mUSDC
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleFaucetWETH}
        >
          Faucet 10 WETH
        </button>
      </div>
            
            <WalletBalancesTable
        walletBalances={
          walletBalances
        }
      />

      <MarketsTable
        reserves={
          reserves
        }
      />

      <PositionsTable
        userPositions={
          userPositions
        }
        onToggleCollateral={
          handleToggleCollateral
        }
      />
    </div>
  </div>
);
}


