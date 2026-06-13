
import { ethers } from "ethers";

async function main() {
  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545",
    );

  const block =
    await provider.getBlockNumber();

  console.log(
    "BLOCK:",
    block,
  );

  const code =
    await provider.getCode(
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    );

  console.log(
    "USDC CODE:",
    code.slice(0, 20),
  );
}

main();

