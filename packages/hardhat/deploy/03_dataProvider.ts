import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

export default deployScript(
  async env => {
    const {
      deploy,
      execute,
      get,
      namedAccounts,
    } = env;

    const { deployer } = namedAccounts;

    const provider = await get(
      "PoolAddressesProvider",
    );

    console.log(
      "Deploying AaveProtocolDataProvider...",
    );

    const dataProvider =
      await deploy(
        "AaveProtocolDataProvider",
        {
          account: deployer,
          artifact:
            artifacts.AaveProtocolDataProvider,
          args: [
            provider.address,
          ],
        },
      );

    console.log(
      "AaveProtocolDataProvider =",
      dataProvider.address,
    );

    console.log(
      "Registering DataProvider...",
    );

    await execute(provider, {
      account: deployer,
      functionName:
        "setPoolDataProvider",
      args: [
        dataProvider.address,
      ],
    });

    console.log(
      "DataProvider registered",
    );
  },
  {
    tags: ["dataProvider"],
    dependencies: [
      "core",
      "reserves",
    ],
  },
);