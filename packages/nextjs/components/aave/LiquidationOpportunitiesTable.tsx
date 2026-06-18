"use client";

import type { Address } from "viem";

export type LiquidationOpportunity = {
  address: Address;
  healthFactor: number;
  updatedAt: string;
};

type Props = {
  candidates: LiquidationOpportunity[];
  loading?: boolean;
  onRefresh?: () => void;
  onSelect?: (address: Address) => void;
};

function shortAddress(address: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LiquidationOpportunitiesTable({
  candidates,
  loading = false,
  onRefresh,
  onSelect,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Liquidation Opportunities</h3>
          <p className="text-sm text-slate-400">Hiển thị các ví có HF thấp hơn 1.1.</p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          {loading ? "Đang quét..." : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 text-left">Địa chỉ ví</th>
              <th className="py-2 text-right">HF</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="py-6 text-center text-slate-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-6 text-center text-slate-500">
                  Chưa có ví nào trong watchlist hoặc chưa có ví nào HF &lt; 1.1.
                </td>
              </tr>
            ) : (
              candidates.map(item => (
                <tr
                  key={item.address}
                  onClick={() => onSelect?.(item.address)}
                  className="cursor-pointer border-t border-slate-800 hover:bg-slate-900/70"
                >
                  <td className="py-3">
                    <div className="font-medium text-white">{shortAddress(item.address)}</div>
                    <div className="text-xs text-slate-500">{item.address}</div>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.healthFactor < 1
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      {item.healthFactor.toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}