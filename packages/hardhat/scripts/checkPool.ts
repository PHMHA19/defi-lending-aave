import fs from "fs";
import hre from "hardhat";

async function main() {
  const json = JSON.parse(
    fs.readFileSync(
      "./deployments/localhost/PoolAddressesProvider.json",
      "utf8",
    ),
  );

  const provider = await hre.ethers.getContractAt(
    json.abi,
    json.address,
  );

  console.log(
    "Pool =",
    await provider.getPool(),
  );

  console.log(
    "PoolConfigurator =",
    await provider.getPoolConfigurator(),
  );

  console.log(
    "ACLManager =",
    await provider.getACLManager(),
  );
}

main().catch(console.error);