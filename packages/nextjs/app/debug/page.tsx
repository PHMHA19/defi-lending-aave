import { DebugContracts } from "./_components/DebugContracts";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Quản lý Smart Contract",
  description: "Tương tác và kiểm tra smart contract trong DeFi Lending Viction",
});

const Debug: NextPage = () => {
  return (
    <>
      <DebugContracts />
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Quản lý Smart Contract</h1>
        <p className="text-neutral">
          Bạn có thể tương tác và kiểm tra các smart contract đã triển khai tại đây.
          <br /> Chỉnh sửa tại{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / app / debug / page.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default Debug;
