
import type {
  UserReserveData,
} from "~~/types/aave";

import {
  formatTokenAmount,
} from "~~/utils/aaveFormat";

import {
  TokenIcon,
} from "~~/components/aave/TokenIcon";

type Props = {
  userPositions: UserReserveData[];

  onToggleCollateral: (
    asset: `0x${string}`,
    enabled: boolean,
  ) => Promise<void>;
};

export function PositionsTable({
  userPositions,
  onToggleCollateral,
}: Props) {

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Your Positions
        </h2>

        <p className="text-slate-400">
          Your supplied and borrowed assets
        </p>
      </div>

      {userPositions.length === 0 ? (
        <div className="text-slate-400">
          No active positions
        </div>
      ) : (

        <div className="overflow-x-auto">

          <table className="table">

            <thead className="text-slate-300">
              <tr>
                <th>Asset</th>

                <th>
                  Supplied
                </th>

                <th>
                  Debt
                </th>

                <th>
                  Collateral
                </th>
              </tr>
            </thead>

            <tbody>

              {userPositions.map(
                position => (
                  <tr
                    key={
                      position.asset
                    }
                  >
                   
                    <td>
                      <div className="flex items-center gap-3">

                        <TokenIcon
                          symbol={
                            position.symbol
                          }
                        />

                        <div className="font-bold text-white">
                          {
                            position.symbol
                          }
                        </div>

                      </div>
                    </td>
                  


                    <td>
                      {formatTokenAmount(
                        position.supplied,
                        position.decimals,
                      )}
                    </td>

                    <td className="text-warning">
                      {formatTokenAmount(
                        position.variableDebt,
                        position.decimals,
                      )}
                    </td>

                    <td>
                      <button
                        className={
                          position.usageAsCollateralEnabled
                            ? "btn btn-success btn-sm"
                            : "btn btn-error btn-sm"
                        }
                        onClick={() =>
                          onToggleCollateral(
                            position.asset,
                            !position.usageAsCollateralEnabled,
                          )
                        }
                      >
                        {position.usageAsCollateralEnabled
                          ? "ON"
                          : "OFF"}
                      </button>
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
