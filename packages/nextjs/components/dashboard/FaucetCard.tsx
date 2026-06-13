"use client";

import {
  useAccount,
} from "wagmi";

import {
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

export const FaucetCard = () => {

  const { address } = useAccount();

  const {
    writeContractAsync,
    isMining,
  } = useScaffoldWriteContract("MockUSDC");

  const handleMint = async () => {

    if (!address) return;

    try {

      await writeContractAsync({
        functionName: "mint",
        args: [
          address,
          BigInt(1000 * 10 ** 6),
        ],
      });

    } catch (err) {

      console.log(err);

    }
  };

  return (
    <div className="bg-base-200 rounded-2xl p-6 shadow mb-8">

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-2xl font-bold mb-2">
            Faucet Testnet
          </h2>

          <p className="opacity-70">
            Mint 1000 USDC test để thử nghiệm
          </p>

        </div>

        <button
          className="btn btn-primary"
          onClick={handleMint}
          disabled={isMining}
        >
          {
            isMining
              ? "Đang mint..."
              : "Mint USDC"
          }
        </button>

      </div>

    </div>
  );
};
