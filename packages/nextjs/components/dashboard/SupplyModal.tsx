"use client";

import { useState } from "react";

import { parseUnits } from "viem";

import {
  useScaffoldWriteContract,
  useDeployedContractInfo,
} from "~~/hooks/scaffold-eth";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const SupplyModal = ({
  open,
  onClose,
}: Props) => {

  const [amount, setAmount] = useState("");

  // lấy địa chỉ LendingPool tự động
  const { data: lendingPoolData } =
    useDeployedContractInfo({
      contractName: "LendingPool",
    });

  // approve USDC
  const {
    writeContractAsync,
    isMining,
  } = useScaffoldWriteContract("MockUSDC");

  // supply vào pool
  const {
    writeContractAsync: supplyAsync,
    isMining: isSupplying,
  } = useScaffoldWriteContract("LendingPool");

  if (!open) return null;

  const handleSupply = async () => {

    try {

      const lendingPoolAddress =
        lendingPoolData?.address;

      if (!lendingPoolAddress) {
        throw new Error(
          "No lending pool address"
        );
      }

      // chuyển số thành blockchain units
      const parsedAmount =
        parseUnits(amount, 6);

      // approve token
      await writeContractAsync({
        functionName: "approve",
        args: [
          lendingPoolAddress,
          parsedAmount,
        ],
      });

      // chờ blockchain sync allowance
      await new Promise(resolve =>
        setTimeout(resolve, 3000)
      );

      // supply token
      await supplyAsync({
        functionName: "supply",
        args: [parsedAmount],
      });

      setAmount("");

      onClose();

    } catch (err) {

      console.log(err);

    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-base-100 p-8 rounded-2xl w-[400px] shadow-2xl">

        <h2 className="text-3xl font-bold mb-2">
          Nạp USDC
        </h2>

        <p className="opacity-60 mb-6">
          Nạp tài sản vào giao thức lending
        </p>

        <input
          type="number"
          placeholder="Nhập số lượng USDC"
          className="input input-bordered w-full mb-6"
          value={amount}
          onChange={e =>
            setAmount(e.target.value)
          }
        />

        <div className="flex justify-end gap-3">

          <button
            className="btn"
            onClick={onClose}
          >
            Huỷ
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSupply}
            disabled={
              isMining ||
              isSupplying ||
              !amount
            }
          >
            {
              isMining || isSupplying
                ? "Đang xử lý..."
                : "Nạp tài sản"
            }
          </button>

        </div>

      </div>

    </div>
  );
};
