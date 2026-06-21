import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

const ONE_DAY = 60 * 60 * 24;
const THREE_DAYS = 3 * ONE_DAY;
const TEN_DAYS = 10 * ONE_DAY;
const ONE_DAY_BIGINT = 60n * 60n * 24n;

export default deployScript(
  async (env) => {
    const { deploy, execute, namedAccounts } = env;
    const { deployer } = namedAccounts;

    console.log("Deploying governance executors...");

    const level1Executor = await deploy("Level1Executor", {
      account: deployer,
      artifact: artifacts.Executor,
    });

    const level2Executor = await deploy("Level2Executor", {
      account: deployer,
      artifact: artifacts.Executor,
    });

    console.log("Deploying governance power strategy...");

    const powerStrategy = await deploy("GovernancePowerStrategy", {
      account: deployer,
      artifact: artifacts.GovernancePowerStrategy,
    });

    console.log("Deploying payloads controller...");

    const payloadsController = await deploy("PayloadsController", {
      account: deployer,
      artifact: artifacts.PayloadsController,
      args: [
        deployer,
        deployer,
        31337n,
      ],
    });

    console.log("Initializing payloads controller...");

    await execute(payloadsController, {
      account: deployer,
      functionName: "initialize",
      args: [
        deployer,
        deployer,
        [
          {
            accessLevel: 1,
            executorConfig: {
              executor: level1Executor.address,
              delay: ONE_DAY,
            },
          },
          {
            accessLevel: 2,
            executorConfig: {
              executor: level2Executor.address,
              delay: TEN_DAYS,
            },
          },
        ],
      ],
    });

    console.log("Deploying governance...");

    const governance = await deploy("Governance", {
      account: deployer,
      artifact: artifacts.Governance,
      args: [
        deployer,
        ONE_DAY_BIGINT,
        deployer,
      ],
    });

    console.log("Initializing governance...");

    await execute(governance, {
      account: deployer,
      functionName: "initialize",
      args: [
        deployer,
        deployer,
        powerStrategy.address,
        [
          {
            accessLevel: 1,
            coolDownBeforeVotingStart: ONE_DAY,
            votingDuration: THREE_DAYS,
            yesThreshold: 320_000n * 10n ** 18n,
            yesNoDifferential: 80_000n * 10n ** 18n,
            minPropositionPower: 80_000n * 10n ** 18n,
          },
          {
            accessLevel: 2,
            coolDownBeforeVotingStart: ONE_DAY,
            votingDuration: TEN_DAYS,
            yesThreshold: 1_040_000n * 10n ** 18n,
            yesNoDifferential: 1_040_000n * 10n ** 18n,
            minPropositionPower: 200_000n * 10n ** 18n,
          },
        ],
        [deployer],
        1_000_000n,
        0n,
      ],
    });

    console.log("Governance deployment completed.");
  },
  {
    tags: ["governance"],
    dependencies: ["core", "reserves"],
  },
);
