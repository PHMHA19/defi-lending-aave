import { ethers } from "ethers";

async function main() {
  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545",
    );

  const usdc =
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  const user =
    "0xE55d6FbFD2DA1562187BBc5B874a070a490F410B";

  const contract =
    new ethers.Contract(
      usdc,
      [
        "function balanceOf(address) view returns (uint256)",
      ],
      provider,
    );

  const balance =
    await contract.balanceOf(user);

  console.log(
    "USDC:",
    Number(balance) / 1e6,
  );
}

main();