
import type {
  UserReserveData,
} from "~~/types/aave";

type Props = {
  withdrawAssetAddress:
    `0x${string}` | "";

  setWithdrawAssetAddress:
    (
      value:
        `0x${string}` | "",
    ) => void;

  withdrawAmount:
    string;

  setWithdrawAmount:
    (
      value: string,
    ) => void;

  userPositions:
    UserReserveData[];

  handleWithdraw:
    () => void;
  
  address?:
    `0x${string}`;
};

export function
WithdrawCard({
  withdrawAssetAddress,
  setWithdrawAssetAddress,
  withdrawAmount,
  setWithdrawAmount,
  userPositions,
  handleWithdraw,
  address,
}: Props) {

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 space-y-4 border border-slate-700 shadow-xl hover:scale-[1.02] transition-all duration-300">

      <div>
        <h3 className="text-xl font-black text-white">
          Withdraw
        </h3>

        <p className="text-sm text-slate-400">
          Withdraw supplied assets
        </p>
      </div>

      <select
        className="select select-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          withdrawAssetAddress
        }

        onChange={e =>
          setWithdrawAssetAddress(
            e.target
              .value as `0x${string}`,
          )
        }
      >
        <option value="">
          Select Withdraw Asset
        </option>

        {userPositions.map(
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

        placeholder="Withdraw Amount"

        className="input input-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          withdrawAmount
        }

        onChange={e =>
          setWithdrawAmount(
            e.target.value,
          )
        }
      />

      <div className="mt-auto">
        <button
          className="btn btn-warning w-full"
          onClick={handleWithdraw}
          disabled={!address}
        >
          Withdraw
        </button>

      </div>

    </div>
  );
}

