
import type {
  ReserveData,
} from "~~/types/aave";

type Props = {
  borrowAssetAddress:
    `0x${string}` | "";

  setBorrowAssetAddress:
    (
      value:
        `0x${string}` | "",
    ) => void;

  borrowAmount:
    string;

  setBorrowAmount:
    (
      value: string,
    ) => void;

  reserves:
    ReserveData[];

  handleBorrow:
    () => void;

  address?:
    `0x${string}`;
};

export function
BorrowCard({
  borrowAssetAddress,
  setBorrowAssetAddress,
  borrowAmount,
  setBorrowAmount,
  reserves,
  handleBorrow,
  address,
}: Props) {

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 space-y-4 border border-slate-700 shadow-xl hover:scale-[1.02] transition-all duration-300">

      <div>
        <h3 className="text-xl font-black text-white">
          Borrow
        </h3>

        <p className="text-sm text-slate-400">
          Borrow assets from Aave
        </p>
      </div>

      <select
        className="select select-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          borrowAssetAddress
        }

        onChange={e =>
          setBorrowAssetAddress(
            e.target
              .value as `0x${string}`,
          )
        }
      >
        <option value="">
          Select Borrow Asset
        </option>

        {reserves.map(
          reserve => (
            <option
              key={
                reserve.asset
              }

              value={
                reserve.asset
              }
            >
              {
                reserve.symbol
              }
            </option>
          ),
        )}
      </select>

      <input
        type="text"

        placeholder="Borrow Amount"

        className="input input-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          borrowAmount
        }

        onChange={e =>
          setBorrowAmount(
            e.target.value,
          )
        }
      />

      <button
        className="btn btn-accent w-full"

        onClick={
          handleBorrow
        }

        disabled={!address}
      >
        Borrow
      </button>

    </div>
  );
}

