
import type {
  UserReserveData,
} from "~~/types/aave";

type Props = {
  repayAssetAddress:
    `0x${string}` | "";

  setRepayAssetAddress:
    (
      value:
        `0x${string}` | "",
    ) => void;

  repayAmount:
    string;

  setRepayAmount:
    (
      value: string,
    ) => void;

  userPositions:
    UserReserveData[];

  handleRepay:
    () => void;


  address?:
    `0x${string}`;
};

export function
RepayCard({
  repayAssetAddress,
  setRepayAssetAddress,
  repayAmount,
  setRepayAmount,
  userPositions,
  handleRepay,
  address,
}: Props) {

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 space-y-4 border border-slate-700 shadow-xl hover:scale-[1.02] transition-all duration-300">

      <div>
        <h3 className="text-xl font-black text-white">
          Repay
        </h3>

        <p className="text-sm text-slate-400">
          Repay borrowed assets
        </p>
      </div>

      <select
        className="select select-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          repayAssetAddress
        }

        onChange={e =>
          setRepayAssetAddress(
            e.target
              .value as `0x${string}`,
          )
        }
      >
        <option value="">
          Select Repay Asset
        </option>

        {userPositions
          .filter(
            position =>
              position.variableDebt >
              0n,
          )
          .map(
            position => (
              <option
                key={
                  position.asset
                }

                value={
                  position.asset
                }
              >
                {
                  position.symbol
                }
              </option>
            ),
          )}
      </select>

      <input
        type="text"

        placeholder="Repay Amount"

        className="input input-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          repayAmount
        }

        onChange={e =>
          setRepayAmount(
            e.target.value,
          )
        }
      />

      <div className="mt-auto">
        <button
          className="btn btn-success w-full"
          onClick={handleRepay}
          disabled={!address}
        >
          Repay
        </button>

      </div>

    </div>
  );
}

