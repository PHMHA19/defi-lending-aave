import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

export default deployScript(
  async env => {
    const {
      deploy,
      namedAccounts,
      execute,
      get,
      read,
    } = env;

    const { deployer } =
      namedAccounts;

    const provider =
      await get(
        "PoolAddressesProvider",
      );

    const poolAddress =
      (await read(
        provider,
        {
          functionName:
            "getPool",
        },
      )) as any;

    const poolConfiguratorAddress =
      (await read(
        provider,
        {
          functionName:
            "getPoolConfigurator",
        },
      )) as any;

    console.log(
      "Pool =",
      poolAddress,
    );

    console.log(
      "PoolConfigurator =",
      poolConfiguratorAddress,
    );

    //
    // WETH ONLY
    //
    const weth =
      await deploy(
        "MockWETH",
        {
          account:
            deployer,

          artifact:
            artifacts.WETH9Mocked,

          args: [],
        },
      );

    console.log(
      "WETH =",
      weth.address,
    );

    console.log(
      "ADDING WETH RESERVE",
      weth.address,
    );
    //
    // Strategy
    //
    const strategy =
      await get(
        "DefaultReserveInterestRateStrategy",
      );

    const aTokenImpl =
      await get(
        "ATokenImpl",
      );

    const stableDebtImpl =
      await get(
        "StableDebtTokenImpl",
      );

    const variableDebtImpl =
      await get(
        "VariableDebtTokenImpl",
      );

    //
    // ADD WETH RESERVE
    //
    await execute(
      {
        address:
          poolConfiguratorAddress,

        abi:
          artifacts.PoolConfigurator
            .abi,
      },
      {
        account:
          deployer,

        functionName:
          "initReserves",

        args: [
          [
            {
              aTokenImpl:
                aTokenImpl.address,

              stableDebtTokenImpl:
                stableDebtImpl.address,

              variableDebtTokenImpl:
                variableDebtImpl.address,

              underlyingAssetDecimals:
                18,

              interestRateStrategyAddress:
                strategy.address,

              underlyingAsset:
                weth.address,

              treasury:
                deployer,

              incentivesController:
                "0x0000000000000000000000000000000000000000",

              aTokenName:
                "Aave WETH",

              aTokenSymbol:
                "aWETH",

              variableDebtTokenName:
                "Aave Variable Debt WETH",

              variableDebtTokenSymbol:
                "variableDebtWETH",

              stableDebtTokenName:
                "Aave Stable Debt WETH",

              stableDebtTokenSymbol:
                "stableDebtWETH",

              params:
                "0x",
            },
          ],
        ],
      },
    );

    console.log(
      "WETH reserve initialized",
    );

    await execute(
      {
        address:
          poolConfiguratorAddress,

        abi:
          artifacts.PoolConfigurator
            .abi,
      },
      {
        account:
          deployer,

        functionName:
          "configureReserveAsCollateral",

        args: [
          weth.address,
          8250n,
          8500n,
          10500n,
        ],
      },
    );

    await execute(
      {
        address:
          poolConfiguratorAddress,

        abi:
          artifacts.PoolConfigurator
            .abi,
      },
      {
        account:
          deployer,

        functionName:
          "setReserveBorrowing",

        args: [
          weth.address,
          true,
        ],
      },
    );

    console.log(
      "WETH borrowing enabled",
    );
  },
  {
    tags: ["weth"],
  },
);