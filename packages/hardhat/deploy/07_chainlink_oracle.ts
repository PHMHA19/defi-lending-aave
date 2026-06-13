import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

export default deployScript(
  async (env) => {
    const {
      deploy,
      get,
      execute,
      namedAccounts,
    } = env;

    const { deployer } =
      namedAccounts;

    const provider =
      await get(
        "PoolAddressesProvider",
      );

    const usdc =
      await get(
        "MockUSDC",
      );
    const weth =
      await get(
        "MockWETH",
  );
    const oracle =
      await deploy(
        "AaveOracle",
        {
          account:
            deployer,

          artifact:
            artifacts.AaveOracle,

          args: [
            provider.address,
            [
              usdc.address,
              weth.address,
            ],
            [
              "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E", // USDC/USD
              "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD
            ],

            // fallbackOracle
            "0x37107a50c4B007e01094740D504848ea56921984",

            "0x0000000000000000000000000000000000000000",
            100000000n,

          ],
        },
      );

    console.log(
      "AaveOracle =",
      oracle.address,
    );

    await execute(
      provider,
      {
        account:
          deployer,

        functionName:
          "setPriceOracle",

        args: [
          oracle.address,
        ],
      },
    );

    console.log(
      "Oracle migrated to Chainlink",
    );
  },
  {
    tags: [
      "chainlink",
    ],
    
  },
);