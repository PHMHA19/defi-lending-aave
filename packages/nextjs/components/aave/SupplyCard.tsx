
type Props = {
  selectedAsset:
    `0x${string}` | "";

  setSelectedAsset:
    (
      value:
        `0x${string}` | "",
    ) => void;

  supplyAmount:
    string;

  setSupplyAmount:
    (
      value: string,
    ) => void;

  walletBalances: any[];

  handleSupply:
    () => void;

  loading:
    boolean;

    address:
    `0x${string}` | undefined;

};

export function
SupplyCard({
  selectedAsset,
  setSelectedAsset,
  supplyAmount,
  setSupplyAmount,
  walletBalances,
  handleSupply,
  loading,
  address,
}: Props) {
 
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 space-y-4 border border-slate-700 shadow-xl hover:scale-[1.02] transition-all duration-300">

      <div>
        <h3 className="text-xl font-black text-white">
          Supply
        </h3>

        <p className="text-sm text-slate-400">
          Deposit assets into Aave
        </p>
      </div>

      <select
        className="select select-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          selectedAsset
        }

        onChange={e =>
          setSelectedAsset(
            e.target
              .value as `0x${string}`,
          )
        }
      >
        <option value="">
          Select Asset
        </option>

        {walletBalances.map(
          balance => (
            <option
              key={
                balance.asset
              }

              value={
                balance.asset
              }
            >
              {
                balance.symbol
              }
            </option>
          ),
        )}
      </select>
   

      <input
        type="text"

        placeholder="Amount"

        className="input input-bordered bg-slate-800 border-slate-600 text-white w-full"

        value={
          supplyAmount
        }

        onChange={e =>
          setSupplyAmount(
            e.target.value,
          )
        }
      />

      <button
        className="btn btn-primary w-full"

        onClick={
          handleSupply
        }

        disabled={
          !address ||
          loading
        }
      >
        {loading
          ? "Loading..."
          : "Supply"}
      </button>

    </div>
  );
}

