import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

export default deployScript(
  async (env) => {
    const { deploy, namedAccounts, read, execute } = env;

    const { deployer } = namedAccounts;

    //
    // PoolAddressesProvider
    //
    console.log("Deploying PoolAddressesProvider...");

    console.log("DEPLOYER =", deployer);

    const provider = await deploy("PoolAddressesProvider", {
      account: deployer,
      artifact: artifacts.PoolAddressesProvider,
      args: ["Viction Market", deployer],
    });

    console.log("PoolAddressesProvider:", provider.address);

    //
    // ACL Admin
    //
 // const currentAclAdmin = await read(provider, {
  //  functionName: "getACLAdmin",
  //});

    const currentAclAdmin =
      "0x0000000000000000000000000000000000000000";

    if (
      currentAclAdmin ===
      "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Setting ACL Admin...");

      await execute(provider, {
        account: deployer,
        functionName: "setACLAdmin",
        args: [deployer],
      });
    }

    // console.log(
    //   "ACL Admin:",
    //   await read(provider, {
    //     functionName: "getACLAdmin",
    //   }),
    // );

    //
    // ACLManager
    //
    console.log("Deploying ACLManager...");

    const aclManager = await deploy("ACLManager", {
      account: deployer,
      artifact: artifacts.ACLManager,
      args: [provider.address],
    });

    console.log("ACLManager:", aclManager.address);

    console.log("Registering ACLManager...");

    await execute(provider, {
      account: deployer,
      functionName: "setACLManager",
      args: [aclManager.address],
    });

    //
    // Pool libraries
    //
    console.log("Deploying Pool libraries...");

    console.log(
      "SupplyLogic artifact =",
      !!artifacts.contracts_protocol_libraries_logic_SupplyLogic_sol_SupplyLogic,
    );

    console.log(
      "BorrowLogic artifact =",
      !!artifacts.contracts_protocol_libraries_logic_BorrowLogic_sol_BorrowLogic,
    );

    console.log(
      "PoolLogic artifact =",
      !!artifacts.PoolLogic,
    );

    const supplyLogic = await deploy("SupplyLogic", {
      account: deployer,
      artifact:
        artifacts.contracts_protocol_libraries_logic_SupplyLogic_sol_SupplyLogic,
    });

    const borrowLogic = await deploy("BorrowLogic", {
      account: deployer,
      artifact:
        artifacts.contracts_protocol_libraries_logic_BorrowLogic_sol_BorrowLogic,
    });

    const reserveLogic = await deploy("ReserveLogic", {
      account: deployer,
      artifact:
        artifacts.contracts_protocol_libraries_logic_ReserveLogic_sol_ReserveLogic,
    });

    const liquidationLogic = await deploy("LiquidationLogic", {
      account: deployer,
      artifact: artifacts.LiquidationLogic,
    });

    const flashLoanLogic = await deploy(
      "FlashLoanLogic",
      {
        account: deployer,
        artifact: artifacts.FlashLoanLogic,
      },
      {
        libraries: {
          BorrowLogic: borrowLogic.address,
        },
      },
    );

    const bridgeLogic = await deploy("BridgeLogic", {
      account: deployer,
      artifact: artifacts.BridgeLogic,
    });

    const eModeLogic = await deploy("EModeLogic", {
      account: deployer,
      artifact: artifacts.EModeLogic,
    });

    console.log("BEFORE POOL LOGIC");

    const poolLogic = await deploy("PoolLogic", {
      account: deployer,
      artifact: artifacts.PoolLogic,
    });

    console.log("AFTER POOL LOGIC");
    console.log("PoolLogic =", poolLogic.address);

    console.log("SupplyLogic:", supplyLogic.address);
    console.log("BorrowLogic:", borrowLogic.address);
    console.log("ReserveLogic:", reserveLogic.address);
    console.log("LiquidationLogic:", liquidationLogic.address);
    console.log("FlashLoanLogic:", flashLoanLogic.address);
    console.log("BridgeLogic:", bridgeLogic.address);
    console.log("EModeLogic:", eModeLogic.address);
    console.log("PoolLogic:", poolLogic.address);

    //
    // Pool implementation
    //
    console.log("Deploying Pool implementation...");

    const poolImpl = await deploy(
      "PoolImpl",
      {
        account: deployer,
        artifact: artifacts.Pool,
        args: [provider.address],
      },
      {
        libraries: {
          ReserveLogic: reserveLogic.address,
          BorrowLogic: borrowLogic.address,
          BridgeLogic: bridgeLogic.address,
          EModeLogic: eModeLogic.address,
          FlashLoanLogic: flashLoanLogic.address,
          LiquidationLogic: liquidationLogic.address,
          PoolLogic: poolLogic.address,
          SupplyLogic: supplyLogic.address,
        },
      },
    );

    console.log("PoolImpl:", poolImpl.address);

    console.log("Registering Pool implementation...");

    await execute(provider, {
      account: deployer,
      functionName: "setPoolImpl",
      args: [poolImpl.address],
    });

    console.log("Grant PoolAdmin...");

    await execute(aclManager, {
      account: deployer,
      functionName: "addPoolAdmin",
      args: [deployer],
    });

    console.log("Grant AssetListingAdmin...");

    await execute(aclManager, {
      account: deployer,
      functionName: "addAssetListingAdmin",
      args: [deployer],
    });

    //
    // ConfiguratorLogic
    //
    console.log("Deploying ConfiguratorLogic...");

    const configuratorLogic = await deploy("ConfiguratorLogic", {
      account: deployer,
      artifact: artifacts.ConfiguratorLogic,
    });

    console.log(
      "ConfiguratorLogic:",
      configuratorLogic.address,
    );

    //
    // PoolConfigurator implementation
    //
    console.log("Deploying PoolConfigurator implementation...");

    const configuratorImpl = await deploy(
      "PoolConfiguratorImpl",
      {
        account: deployer,
        artifact: artifacts.PoolConfigurator,
        args: [],
      },
      {
        libraries: {
          ConfiguratorLogic: configuratorLogic.address,
        },
      },
    );

    console.log(
      "PoolConfiguratorImpl:",
      configuratorImpl.address,
    );

    console.log(
      "Registering PoolConfigurator implementation...",
    );

    await execute(provider, {
      account: deployer,
      functionName: "setPoolConfiguratorImpl",
      args: [configuratorImpl.address],
    });

    console.log("Core deployment completed.");
  },
  {
    tags: ["core"],
  },
);