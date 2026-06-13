
import { ethers } from "ethers";

async function main() {
  /**
   * USDC whale
   */
  const whale =
    "0x28c6c06298d514db089934071355e5743bf21d60";

  /**
   * Your metamask address
   */
  const receiver =
    "0xE55d6FbFD2DA1562187BBc5B874a070a490F410B";

  /**
   * USDC
   */
  const usdc =
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

  /**
   * Provider
   */
  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545",
    );

  /**
   * Impersonate whale
   */
  await provider.send(
    "hardhat_impersonateAccount",
    [whale],
  );
  
  await provider.send( "hardhat_setBalance", [ whale, "0x1000000000000000000000000", ], );
  /**
   * Get signer
   */
  
  const signer =
    new ethers.JsonRpcSigner(
      provider,
      whale,
    );



  /**
   * USDC contract
   */
  const usdcContract =
    new ethers.Contract(
      usdc,
      [
        "function transfer(address to,uint256 amount) returns (bool)",
      ],
      signer,
    );

  /**
   * 1000 USDC
   */
  const amount =
    1_000_000_000;

  /**
   * Transfer
   */
  const tx =
    await usdcContract.transfer(
      receiver,
      amount,
    );

  await tx.wait();

  console.log(
    "Transferred USDC to:",
    receiver,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

