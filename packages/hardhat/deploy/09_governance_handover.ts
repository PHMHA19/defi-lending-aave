import { deployScript } from "../rocketh/deploy.js";

export default deployScript(
  async (env) => {
    const { execute, namedAccounts, get } = env;
    const { deployer } = namedAccounts;

    const poolAddressesProvider = await get("PoolAddressesProvider");
    const aclManager = await get("ACLManager");
    const level1Executor = await get("Level1Executor");

    console.log("Handing over ACL/admin roles to governance executor...");

    await execute(poolAddressesProvider, {
      account: deployer,
      functionName: "setACLAdmin",
      args: [level1Executor.address],
    });

    await execute(aclManager, {
      account: deployer,
      functionName: "addPoolAdmin",
      args: [level1Executor.address],
    });

    await execute(aclManager, {
      account: deployer,
      functionName: "addAssetListingAdmin",
      args: [level1Executor.address],
    });

    console.log("Governance handover completed.");
  },
  {
    tags: ["governance-handover"],
    dependencies: ["governance"],
  },
);
