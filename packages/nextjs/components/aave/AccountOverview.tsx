
import type {
  UserAccountData,
} from "~~/types/aave";

type Props = {
  accountData:
    UserAccountData | null;
};

export function
AccountOverview({
  accountData,
}: Props) {


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
        <div className="text-sm text-slate-400">
          Total Collateral
        </div>

        <div className="text-3xl font-black text-white mt-2">
          $
          {
            accountData ?.totalCollateral ?? "0"
          }
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
        <div className="text-sm text-slate-400">
          Total Debt
        </div>

        <div className="text-3xl font-black text-white mt-2 text-error">
          $
          {
           accountData
            ?.totalDebt
            ?? "0"
          }
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
        <div className="text-sm text-slate-400">
          Available Borrows
        </div>

        <div className="text-3xl font-black text-white mt-2 text-success">
          $
          {
            accountData
              ?.availableBorrows
              ?? "0"
          }
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
        <div className="text-sm text-slate-400">
          Loan To Value
        </div>

        <div className="text-3xl font-black text-white mt-2">
          {
            accountData
              ?.ltv
              ?? "0"
          }
          %
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
        <div className="text-sm text-slate-400">
          Health Factor
        </div>

        <div className="text-3xl font-black text-white mt-2 text-success">
          {
            accountData
              ?.healthFactor
              ?? "∞"
          }
        </div>
      </div>

    </div>
  );
}

