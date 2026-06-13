"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">
              Chào mừng đến với
            </span>

            <span className="block text-4xl font-bold">
              DeFi Lending Viction
            </span>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mt-6">
            <p className="my-2 font-medium">
              Địa chỉ ví đang kết nối:
            </p>

            <Address
              address={connectedAddress}
              chain={targetNetwork}
            />
          </div>

          <p className="text-center text-lg mt-6">
            Nền tảng mô phỏng giao thức cho vay phi tập trung
            được xây dựng bằng Solidity, Hardhat.
          </p>

          <p className="text-center text-lg mt-4">
            Smart contract chính:
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block ml-2 px-2 py-1 rounded-xl">
              LendingPool.sol
            </code>
          </p>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-lg">
              <BugAntIcon className="h-8 w-8 fill-secondary" />

              <p className="mt-4">
                Tương tác với smart contract thông qua tab{" "}
                <Link
                  href="/debug"
                  passHref
                  className="link"
                >
                  Quản lý hợp đồng
                </Link>
              </p>
            </div>

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-lg">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />

              <p className="mt-4">
                Theo dõi giao dịch blockchain trong tab{" "}
                <Link
                  href="/blockexplorer"
                  passHref
                  className="link"
                >
                  Trình khám phá khối
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Home;