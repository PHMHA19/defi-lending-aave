
import type {
  ReserveData,
} from "~~/types/aave";

import {
  formatAPY,
  formatTokenAmount,
  formatLTV,
} from "~~/utils/aaveFormat";


import {
  TokenIcon,
} from "~~/components/aave/TokenIcon";

import {
  formatUnits,
} from "viem";

type Props = {
  reserves:
    ReserveData[];
};

export function
MarketsTable({
  reserves,
}: Props) {

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">

      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">
          Markets
        </h2>

        <p className="text-slate-400">
          Available assets on Aave
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="table text-white">

          <thead className="text-slate-300">
            <tr>
              <th>Asset</th>

              <th>
                Supply APY
              </th>

              <th>
                Borrow APY
              </th>

              <th>
                Price
              </th>

              <th className="text-center">
                LTV
              </th>

              <th>
                Liquidity
              </th>

              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {reserves.map(
              reserve => (
                <tr
                  key={
                    reserve.asset
                  }
                >

                  <td>
                    <div className="flex items-center gap-3">

                      <TokenIcon
                        symbol={
                          reserve.symbol
                        }
                      />

                      <div className="font-bold text-white">
                        {
                          reserve.symbol
                        }
                      </div>

                    </div>
                  </td>


                  <td className="text-success">
                    {formatAPY(
                      reserve.liquidityRate,
                    )}
                    %
                  </td>

                  <td className="text-warning">
                    {formatAPY(
                      reserve.variableBorrowRate,
                    )}
                    %
                  </td>

                  <td>
                    $
                    {Number(
                      formatUnits(
                        reserve.price,
                        8,
                      ),
                    ).toFixed(2)}
                  </td>

                  <td className="text-center font-semibold text-cyan-400">
                    {formatLTV(
                      reserve.ltv,
                    )}%
                  </td>

                  <td>
                    {formatTokenAmount(
                      reserve.liquidity,
                      reserve.decimals,
                    )}
                  </td>

                  <td>

                    {reserve.isActive ? (
                      <div className="badge badge-success">
                        Active
                      </div>
                    ) : (
                      <div className="badge badge-error">
                        Inactive
                      </div>
                    )}

                  </td>
                </tr>
              ),
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}

