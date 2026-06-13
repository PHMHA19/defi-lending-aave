
import type {
  WalletBalance,
} from "~~/types/aave";

import {
  formatTokenAmount,
} from "~~/utils/aaveFormat";

import {
  TokenIcon,
} from "~~/components/aave/TokenIcon";


type Props = {
  walletBalances:
    WalletBalance[];
};

export function
WalletBalancesTable({
  walletBalances,
}: Props) {

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">

      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">
          Wallet Balances
        </h2>

        <p className="text-slate-400">
          Assets in your wallet
        </p>
      </div>

      {walletBalances.length === 0 ? (
        <div className="text-slate-400">
          No wallet balances
        </div>
      ) : (

        <div className="overflow-x-auto">

          <table className="table text-white">

            <thead className="text-slate-300">
              <tr>
                <th>Asset</th>

                <th>
                  Balance
                </th>
              </tr>
            </thead>

            <tbody>

              {walletBalances.map(
                balance => (
                  <tr
                    key={
                      balance.asset
                    }
                  >
                    <td>
                      <div className="flex items-center gap-3">

                        <TokenIcon
                          symbol={
                            balance.symbol
                          }
                        />

                        <div className="font-bold text-white">
                          {
                            balance.symbol
                          }
                        </div>

                      </div>
                    </td>
                  


                    <td>
                      {formatTokenAmount(
                        balance.balance,
                        balance.decimals,
                      )}
                    </td>
                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

