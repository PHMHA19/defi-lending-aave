"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
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
              DeFi Lending
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
            Các chức năng hỗ trợ:
          </p>

          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            <span className="badge badge-primary">Supply</span>
            <span className="badge badge-secondary">Borrow</span>
            <span className="badge badge-accent">Withdraw</span>
            <span className="badge badge-info">Repay</span>
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-lg">
              <BanknotesIcon className="h-8 w-8 fill-secondary" />

              <p className="mt-4">
                Tương tác với smart contract thông qua tab{" "}
                <Link
                  href="/lending"
                  
                  className="link"
                >
                  Giao thức cho vay
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