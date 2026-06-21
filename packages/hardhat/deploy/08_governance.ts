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

    const chainId = BigInt(env.network.chain.id);

    const governanceTokenAddress = process.env.GOVERNANCE_TOKEN_ADDRESS;
    if (!governanceTokenAddress) {
      throw new Error("Missing GOVERNANCE_TOKEN_ADDRESS");
    }

    const l1YesThreshold = BigInt(
      process.env.L1_YES_THRESHOLD ?? "320000000000000000000000"
    );
    const l1YesNoDifferential = BigInt(
      process.env.L1_YES_NO_DIFFERENTIAL ?? "80000000000000000000000"
    );
    const l1MinPropositionPower = BigInt(
      process.env.L1_MIN_PROPOSITION_POWER ?? "80000000000000000000000"
    );
    const l2YesThreshold = BigInt(
      process.env.L2_YES_THRESHOLD ?? "1040000000000000000000000"
    );
    const l2YesNoDifferential = BigInt(
      process.env.L2_YES_NO_DIFFERENTIAL ?? "1040000000000000000000000"
    );
    const l2MinPropositionPower = BigInt(
      process.env.L2_MIN_PROPOSITION_POWER ?? "200000000000000000000000"
    );
    const gasLimit = BigInt(
      process.env.GOVERNANCE_GAS_LIMIT ?? "1000000"
    );
    const cancellationFee = BigInt(
      process.env.GOVERNANCE_CANCELLATION_FEE ?? "1000000000000000"
    );

    const votingPortals = process.env.VOTING_PORTAL_ADDRESS
      ? [process.env.VOTING_PORTAL_ADDRESS as `0x${string}`]
      : [];

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
      args: [governanceTokenAddress as `0x${string}`],
    });

    console.log("Deploying payloads controller...");

    const payloadsController = await deploy("PayloadsController", {
      account: deployer,
      artifact: artifacts.PayloadsController,
      args: [deployer, deployer, chainId],
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
      args: [deployer, ONE_DAY_BIGINT, deployer],
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
            yesThreshold: l1YesThreshold,
            yesNoDifferential: l1YesNoDifferential,
            minPropositionPower: l1MinPropositionPower,
          },
          {
            accessLevel: 2,
            coolDownBeforeVotingStart: ONE_DAY,
            votingDuration: TEN_DAYS,
            yesThreshold: l2YesThreshold,
            yesNoDifferential: l2YesNoDifferential,
            minPropositionPower: l2MinPropositionPower,
          },
        ],
        votingPortals,
        gasLimit,
        cancellationFee,
      ],
    });

    console.log("Governance deployment completed.");
  },
  {
    tags: ["governance"],
    dependencies: ["core", "reserves"],
  },
);
