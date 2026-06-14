import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";
import * as chains from "viem/chains";
export default deployScript(
  async (env) => {
    const {
      deploy,
      namedAccounts,
      execute,
      get,
      read,
    } = env;

    const { deployer } = namedAccounts;

    //
    // Provider
    //
    console.log("STEP 1");

    const provider = await get("PoolAddressesProvider");

    console.log("STEP 2");

    //
    // Proxy addresses
    // TEMP FIX FOR ROCKETH ABI BUG
    //
    const poolAddress = (
      await read(provider, {
        functionName: "getPool",
      })
    ) as any;

    console.log("STEP 3");

    const poolConfiguratorAddress = (
      await read(provider, {
        functionName: "getPoolConfigurator",
      })
    ) as any;

    console.log("STEP 4");

    console.log("Pool =", poolAddress);
    console.log("PoolConfigurator Proxy =", poolConfiguratorAddress);

    //
    // Mock USDC
    //
    const usdc = await deploy("MockUSDC", {
      account: deployer,
      artifact: artifacts.MintableERC20,
      args: ["Mock USD Coin", "mUSDC", 6],
    });

    //
    // Interest Rate Strategy
    //
    const strategy = await deploy(
      "DefaultReserveInterestRateStrategy",
      {
        account: deployer,
        artifact:
          artifacts.contracts_protocol_pool_DefaultReserveInterestRateStrategy_sol_DefaultReserveInterestRateStrategy,
        args: [
          provider.address,

          800000000000000000000000000n,
          0n,

          40000000000000000000000000n,
          750000000000000000000000000n,

          20000000000000000000000000n,
          750000000000000000000000000n,

          20000000000000000000000000n,
          200000000000000000000000000n,

          200000000000000000000000000n,
        ],
      }
    );

    //
    // Token implementations
    //
    const aTokenImpl = await deploy("ATokenImpl", {
      account: deployer,
      artifact:
        artifacts.contracts_protocol_tokenization_AToken_sol_AToken,
      args: [poolAddress],
    });

    const stableDebtImpl = await deploy(
      "StableDebtTokenImpl",
      {
        account: deployer,
        artifact:
          artifacts.contracts_protocol_tokenization_StableDebtToken_sol_StableDebtToken,
        args: [poolAddress],
      }
    );

    const variableDebtImpl = await deploy(
      "VariableDebtTokenImpl",
      {
        account: deployer,
        artifact:
          artifacts.contracts_protocol_tokenization_VariableDebtToken_sol_VariableDebtToken,
        args: [poolAddress],
      }
    );

    console.log("ATokenImpl =", aTokenImpl.address);
    console.log("StableDebtImpl =", stableDebtImpl.address);
    console.log("VariableDebtImpl =", variableDebtImpl.address);
    console.log("Strategy =", strategy.address);
    console.log("USDC =", usdc.address);

    console.log("About to call initReserves...");

    //
    // IMPORTANT:
    // Execute on PROXY address but with PoolConfigurator ABI
    //
    await execute(
        {
            address: poolConfiguratorAddress,
            abi: artifacts.PoolConfigurator.abi,
        },
      {
        account: deployer,
        functionName: "initReserves",
        args: [
          [
            {
              aTokenImpl: aTokenImpl.address,
              stableDebtTokenImpl: stableDebtImpl.address,
              variableDebtTokenImpl: variableDebtImpl.address,

              underlyingAssetDecimals: 6,
              interestRateStrategyAddress: strategy.address,
              underlyingAsset: usdc.address,

              treasury: deployer,
              incentivesController:
                "0x0000000000000000000000000000000000000000",

              aTokenName: "Aave USDC",
              aTokenSymbol: "aUSDC",

              variableDebtTokenName:
                "Aave Variable Debt USDC",
              variableDebtTokenSymbol:
                "variableDebtUSDC",

              stableDebtTokenName:
                "Aave Stable Debt USDC",
              stableDebtTokenSymbol:
                "stableDebtUSDC",

              params: "0x",
            },
          ],
        ],
      }
    );

    console.log("USDC reserve initialized");
        await execute(
      {
        address: poolConfiguratorAddress,
        abi: artifacts.PoolConfigurator.abi,
      },
      {
        account: deployer,
        functionName: "configureReserveAsCollateral",
        args: [
          usdc.address,
          8000n,   // LTV 80%
          8500n,   // Liquidation Threshold 85%
          10500n,  // 5% bonus
        ],
      }
    );

    console.log("USDC collateral configured");
    await execute(
      {
        address: poolConfiguratorAddress,
        abi: artifacts.PoolConfigurator.abi,
      },
      {
        account: deployer,
        functionName: "setReserveBorrowing",
        args: [
          usdc.address,
          true,
        ],
      }
    );

    console.log("USDC borrowing enabled");
      },
  {
    tags: ["reserves"],
    dependencies: ["core"],
  },
);