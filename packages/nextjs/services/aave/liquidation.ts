import { writeContract, readContract } from "@wagmi/core";
import { poolAbi } from "./poolAbi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { deployedContracts } from "~~/contracts/deployedContracts";

const chainId = 31337; // hoặc chain ID thực tế (Sepolia, Mainnet etc.)
const poolAddress = (deployedContracts as any)[chainId].pool as `0x${string}`;

// Lấy dữ liệu tài khoản user
export const getUserAccountData = async (userAddress: string) => {
  return await readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: "getUserAccountData",
    args: [userAddress],
    chainId: chainId,
  });
};

// Thực hiện liquidationCall
export const liquidationCall = async (
  collateralAsset: string,
  debtAsset: string,
  user: string,
  debtToCover: bigint,
  receiveAtoken: boolean = false
) => {
  return await writeContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: "liquidationCall",
    args: [collateralAsset, debtAsset, user, debtToCover, receiveAtoken],
    chainId: chainId,
  });
};

// (Tuỳ chọn) Lấy dữ liệu cho từng tài sản của user
export const getUserReserveData = async (asset: string, user: string) => {
  return await readContract({
    address: poolAddress,
    abi: poolAbi,
    functionName: "getUserReserveData",
    args: [asset, user],
    chainId: chainId,
  });
};
