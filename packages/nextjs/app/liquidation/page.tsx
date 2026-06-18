"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LiquidationOpportunitiesTable, {
  type LiquidationOpportunity,
} from "~~/components/aave/LiquidationOpportunitiesTable";
import { useAccount, useChainId } from "wagmi";
import { isAddress, getAddress, type Address, formatUnits} from "viem";
import { getAllReserveData, getUserPositions } from "~~/services/aave/reserve";
import {
  getLiquidationPreview,
  liquidationCallAndWait,
  parseTokenAmount,
} from "~~/services/aave/liquidation";
import type { ReserveData, UserReserveData } from "~~/types/aave";
const Input = (props: any) => (
  <input
    {...props}
    className="input input-bordered w-full text-black"
  />
);

const InputNumber = (props: any) => (
  <input
    type="number"
    {...props}
    className="input input-bordered w-full text-black"
  />
);

const Button = ({ children, ...props }: any) => (
  <button
    {...props}
    className="btn btn-primary"
  >
    {children}
  </button>
);

type PreviewState = Awaited<ReturnType<typeof getLiquidationPreview>> | null;

function shortAddress(address: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const BASE_PRICE_DECIMALS = 8;
const CLOSE_FACTOR = 0.5;

function displaySymbol(symbol: string) {
  const s = symbol.toUpperCase();
  if (s === "WETH") return "ETH";
  if (s === "WBTC") return "BTC";
  return symbol;
}

function formatAmount(amount: bigint, decimals: number, digits = 6) {
  const n = Number(formatUnits(amount, decimals));
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function bonusPercentFromRaw(raw: bigint) {
  // 10500 -> 5.00%
  return Math.max(0, (Number(raw) - 10000) / 100);
}

function priceFromReserve(reserve?: ReserveData | null) {
  if (!reserve) return 0;
  return Number(formatUnits(reserve.price, BASE_PRICE_DECIMALS));
}
function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}


export default function LiquidationPage() {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();

  const [borrower, setBorrower] = useState("");

  const [reserves, setReserves] = useState<ReserveData[]>([]);
  const [borrowerPositions, setBorrowerPositions] = useState<UserReserveData[]>([]);

  const [selectedCollateralAsset, setSelectedCollateralAsset] = useState<Address | "">("");
  const [selectedDebtAsset, setSelectedDebtAsset] = useState<Address | "">("");

  const [debtToCoverHuman, setDebtToCoverHuman] = useState("0");
  const [receiveAToken, setReceiveAToken] = useState(false);

  const [preview, setPreview] = useState<PreviewState>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [opportunities, setOpportunities] = useState<LiquidationOpportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);

  const reservesByAsset = useMemo(() => {
    return new Map<
      `0x${string}`,
      ReserveData
    >(
      reserves.map(r => [
        r.asset,
        r,
      ]),
    );
  }, [reserves]);

  const collateralPositions = useMemo(() => {
    return borrowerPositions.filter(
      p => p.supplied > 0n && p.usageAsCollateralEnabled,
    );
  }, [borrowerPositions]);

  const debtPositions = useMemo(() => {
    return borrowerPositions.filter(
      p => p.stableDebt > 0n || p.variableDebt > 0n,
    );
  }, [borrowerPositions]);

  const selectedCollateralPosition = useMemo(
    () => borrowerPositions.find(p => p.asset === selectedCollateralAsset) ?? null,
    [borrowerPositions, selectedCollateralAsset],
  );

  const selectedDebtPosition = useMemo(
    () => borrowerPositions.find(p => p.asset === selectedDebtAsset) ?? null,
    [borrowerPositions, selectedDebtAsset],
  );

  const selectedCollateralReserve = useMemo(
    () => (selectedCollateralAsset ? reservesByAsset.get(selectedCollateralAsset as `0x${string}`
) ?? null : null),
    [reservesByAsset, selectedCollateralAsset],
  );

  const selectedDebtReserve = useMemo(
    () => (selectedDebtAsset ? reservesByAsset.get(selectedDebtAsset as `0x${string}`) ?? null : null),
    [reservesByAsset, selectedDebtAsset],
  );

  const loadOpportunities = useCallback(async () => {
    setLoadingOpportunities(true);

    try {
      const response = await fetch(`/api/liquidation-candidates?chainId=${chainId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách liquidation opportunities.");
      }

      const json = await response.json();
      setOpportunities(Array.isArray(json?.candidates) ? json.candidates : []);
    } catch (error) {
      console.error(error);
      setOpportunities([]);
    } finally {
      setLoadingOpportunities(false);
    }
  }, [chainId]);

  useEffect(() => {
    void loadOpportunities();

    const timer = window.setInterval(() => {
      void loadOpportunities();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [loadOpportunities]);

  const liquidationQuote = useMemo(() => {
    if (
      !selectedCollateralPosition ||
      !selectedDebtPosition ||
      !selectedCollateralReserve ||
      !selectedDebtReserve
    ) {
      return null;
    }

    const debtToCover = Number(debtToCoverHuman);
    if (!Number.isFinite(debtToCover) || debtToCover <= 0) {
      return null;
    }

    const debtPrice = priceFromReserve(selectedDebtReserve);
    const collateralPrice = priceFromReserve(selectedCollateralReserve);
    if (debtPrice <= 0 || collateralPrice <= 0) return null;

    const selectedDebtTotal = Number(
      formatUnits(
        selectedDebtPosition.stableDebt + selectedDebtPosition.variableDebt,
        selectedDebtPosition.decimals,
      ),
    );

    const selectedCollateralSupplied = Number(
      formatUnits(selectedCollateralPosition.supplied, selectedCollateralPosition.decimals),
    );

    const bonusPct = bonusPercentFromRaw(selectedCollateralReserve.liquidationBonus);
    const bonusRate = bonusPct / 100;

    const debtUsd = debtToCover * debtPrice;
    const collateralUsdNeeded = debtUsd * (1 + bonusRate);
    const collateralTokenNeeded = collateralUsdNeeded / collateralPrice;
    const grossProfitUsd = debtUsd * bonusRate;

    const maxDebtByCollateralUsd =
      (selectedCollateralSupplied * collateralPrice) / (1 + bonusRate);

    const maxDebtByCollateralToken =
      maxDebtByCollateralUsd / debtPrice;

    const maxLiquidatableDebt = selectedDebtTotal * CLOSE_FACTOR;
    const maxDebtAllowed = Math.min(
      maxLiquidatableDebt,
      maxDebtByCollateralToken,
    );

    if (debtToCover > maxLiquidatableDebt + 1e-12) {
      return {
        isValid: false,
        reason: `Vượt Close Factor. Tối đa chỉ được thanh lý ${maxLiquidatableDebt.toFixed(2)} ${displaySymbol(selectedDebtReserve.symbol)}.`,
        debtUsd,
        collateralUsdNeeded,
        collateralTokenNeeded,
        profitUsd: grossProfitUsd,
        bonusUsd: grossProfitUsd,
        bonusPct,
        maxDebtByCollateralUsd,
        maxDebtByCollateralToken,
        maxLiquidatableDebt,
        maxDebtAllowed,
      };
    }

    if (debtToCover > maxDebtAllowed + 1e-12) {
      return {
        isValid: false,
        reason: `Số debt muốn thanh lý vượt quá collateral ${displaySymbol(selectedCollateralReserve.symbol)} khả dụng.`,
        debtUsd,
        collateralUsdNeeded,
        collateralTokenNeeded,
        profitUsd: grossProfitUsd,
        bonusUsd: grossProfitUsd,
        bonusPct,
        maxDebtByCollateralUsd,
        maxLiquidatableDebt,
        maxDebtAllowed,
        maxDebtByCollateralToken,
      };
    }

    return {
      isValid: true,
      debtUsd,
      collateralUsdNeeded,
      collateralTokenNeeded,
      profitUsd: grossProfitUsd,
      bonusUsd: grossProfitUsd,
      bonusPct,
      maxDebtByCollateralUsd,
      maxLiquidatableDebt,
      maxDebtAllowed,
      maxDebtByCollateralToken,
    };
  }, [
    selectedCollateralPosition,
    selectedDebtPosition,
    selectedCollateralReserve,
    selectedDebtReserve,
    debtToCoverHuman,
  ]);



  const canPreview = isAddress(borrower);
  const canLiquidate =
    isAddress(borrower) &&
    isAddress(selectedCollateralAsset) &&
    isAddress(selectedDebtAsset) &&
    Number(debtToCoverHuman) > 0 &&
    preview !== null &&
    preview.isLiquidatable &&
    Boolean(liquidationQuote?.isValid);

  const handleLoadPreview = async (borrowerInput?: string) => {
    setError("");
    setStatus("");

    const targetBorrower = borrowerInput ?? borrower;

    if (!isAddress(targetBorrower)) {
      setPreview(null);
      setError("Địa chỉ người vay không hợp lệ.");
      return;
    }

    try {
      setLoadingPreview(true);

      const borrowerAddress = getAddress(targetBorrower) as `0x${string}`;

      const [previewData, reserveData, positions] = await Promise.all([
        getLiquidationPreview(borrowerAddress, chainId),
        getAllReserveData(),
        getUserPositions(borrowerAddress),
      ]);

      setPreview(previewData);
      setReserves(reserveData);
      setBorrowerPositions(positions);

      const firstCollateral = positions.find(
        p => p.supplied > 0n && p.usageAsCollateralEnabled,
      )?.asset ?? "";

      const firstDebt = positions.find(
        p => p.stableDebt > 0n || p.variableDebt > 0n,
      )?.asset ?? "";

      setSelectedCollateralAsset(prev =>
        prev && positions.some(p => p.asset === prev && p.supplied > 0n && p.usageAsCollateralEnabled)
          ? prev
          : firstCollateral,
      );

      setSelectedDebtAsset(prev =>
        prev && positions.some(p => p.asset === prev && (p.stableDebt > 0n || p.variableDebt > 0n))
          ? prev
          : firstDebt,
      );

      setStatus(
        previewData.isLiquidatable
          ? "Vị thế đủ điều kiện thanh lý."
          : "Vị thế chưa đủ điều kiện thanh lý.",
      );
    } catch (e) {
      console.error(e);
      setPreview(null);
      setReserves([]);
      setBorrowerPositions([]);
      setSelectedCollateralAsset("");
      setSelectedDebtAsset("");
      setError("Không thể lấy dữ liệu vị thế. Kiểm tra địa chỉ, chainId và deployedContracts.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSelectOpportunity = async (address: `0x${string}`) => {
    setBorrower(address);
    await handleLoadPreview(address);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLiquidation = async () => {
    setError("");
    setStatus("");
    setTxHash("");

    if (!isAddress(borrower)) {
      setError("Địa chỉ người vay không hợp lệ.");
      return;
    }
    if (!isAddress(selectedCollateralAsset)) {
      setError("Hãy chọn collateral asset hợp lệ.");
      return;
    }
    if (!isAddress(selectedDebtAsset)) {
      setError("Hãy chọn debt asset hợp lệ.");
      return;
    }

    const amountNumber = Number(debtToCoverHuman);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Số tiền thanh lý phải lớn hơn 0.");
      return;
    }

    if (!liquidationQuote?.isValid) {
      setError(liquidationQuote?.reason ?? "Dữ liệu thanh lý chưa hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);

      const debtAmount = await parseTokenAmount(
        debtToCoverHuman,
        getAddress(selectedDebtAsset),
        chainId,
      );

      const receipt = await liquidationCallAndWait({
        collateralAsset: getAddress(selectedCollateralAsset),
        debtAsset: getAddress(selectedDebtAsset),
        user: getAddress(borrower),
        debtToCover: debtAmount,
        receiveAToken,
        chainId,
      });

      const hash =
        typeof receipt?.transactionHash === "string" ? receipt.transactionHash : "";

      if (hash) setTxHash(hash);
      setStatus("Thanh lý thành công.");

      await handleLoadPreview();
      await loadOpportunities();
    } catch (e: any) {
      console.error(e);
      const message =
        e?.shortMessage ||
        e?.message ||
        "Thanh lý thất bại. Hãy kiểm tra lại HF, token, allowance và số tiền muốn thanh lý.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background:
          "linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(17,24,39,1) 100%)",
        color: "#e5e7eb",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
            Liquidation Dashboard
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6 }}>
            Nhập địa chỉ người vay, xem Health Factor, rồi thanh lý trực tiếp bằng Pool của Aave.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(59,130,246,0.15)",
                color: "#93c5fd",
                fontSize: 13,
              }}
            >
              Chain ID: {chainId}
            </span>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(16,185,129,0.15)",
                color: "#a7f3d0",
                fontSize: 13,
              }}
            >
              Wallet: {connectedAddress ? shortAddress(connectedAddress) : "Chưa kết nối"}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          <section
            style={{
              background: "rgba(15,23,42,0.92)",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.24)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>
              Thông tin vị thế
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, color: "#cbd5e1" }}>
                  Địa chỉ người vay
                </label>
                <Input
                  value={borrower}
                  onChange={(e: any) => setBorrower(e.target.value)}
                  placeholder="0x..."
                  onBlur={() => void handleLoadPreview()}
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button onClick={handleLoadPreview} disabled={!canPreview || loadingPreview}>
                 {loadingPreview ? "Đang tải..." : "Lấy dữ liệu vị thế"}
                </Button>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(30,41,59,0.85)",
                  border: "1px solid rgba(148,163,184,0.14)",
                }}
              >
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#94a3b8" }}>Health Factor</span>
                    <strong style={{ color: preview?.isLiquidatable ? "#fca5a5" : "#86efac" }}>
                      {preview ? preview.healthFactor : "-"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#94a3b8" }}>Total Collateral</span>
                    <strong>{preview ? preview.totalCollateralBase : "-"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#94a3b8" }}>Total Debt</span>
                    <strong>{preview ? preview.totalDebtBase : "-"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#94a3b8" }}>Available Borrows</span>
                    <strong>{preview ? preview.availableBorrowsBase : "-"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#94a3b8" }}>Trạng thái</span>
                    <strong style={{ color: preview?.isLiquidatable ? "#fca5a5" : "#86efac" }}>
                      {preview ? (preview.isLiquidatable ? "Có thể thanh lý" : "An toàn") : "-"}
                    </strong>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Tài sản thế chấp</h3>
                      <table className="w-full text-sm">
                        <thead className="text-slate-400">
                          <tr>
                            <th className="text-left py-2">Asset</th>
                            <th className="text-right py-2">Supplied</th>
                            <th className="text-right py-2">Bonus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collateralPositions.length === 0 ? (
                            <tr><td colSpan={3} className="py-3 text-slate-500">Không có collateral hợp lệ</td></tr>
                          ) : collateralPositions.map(position => {
                            const reserve = reservesByAsset.get(position.asset);
                            const bonus = reserve ? bonusPercentFromRaw(reserve.liquidationBonus) : 0;
                            return (
                              <tr key={position.asset} className="border-t border-slate-800">
                                <td className="py-2 font-medium text-white">{displaySymbol(position.symbol)}</td>
                                <td className="py-2 text-right text-slate-200">
                                  {formatAmount(position.supplied, position.decimals)}
                                </td>
                                <td className="py-2 text-right text-emerald-300">
                                  +{bonus.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Khoản nợ</h3>
                      <table className="w-full text-sm">
                        <thead className="text-slate-400">
                          <tr>
                            <th className="text-left py-2">Asset</th>
                            <th className="text-right py-2">Debt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {debtPositions.length === 0 ? (
                            <tr><td colSpan={2} className="py-3 text-slate-500">Không có khoản nợ hợp lệ</td></tr>
                          ) : debtPositions.map(position => (
                            <tr key={position.asset} className="border-t border-slate-800">
                              <td className="py-2 font-medium text-white">{displaySymbol(position.symbol)}</td>
                              <td className="py-2 text-right text-amber-300">
                                {formatAmount(position.stableDebt + position.variableDebt, position.decimals)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(2,6,23,0.55)",
                  border: "1px dashed rgba(148,163,184,0.25)",
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                }}
              >
                <div><strong>Lưu ý:</strong></div>
                <div>• Health Factor phải &lt; 1 thì mới thanh lý được.</div>
                <div>• Debt amount nhập theo đơn vị gốc của debt asset.</div>
                <div>• File service sẽ tự approve trước khi gọi liquidationCall.</div>
                <div>• Collateral asset và Debt asset phải đúng với vị thế của borrower.</div>
              </div>
            </div>
          </section>

          <section
            style={{
              background: "rgba(15,23,42,0.92)",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.24)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>
              Cấu hình thanh lý
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="block mb-2 text-slate-300">Collateral asset</label>
                <select
                  className="select select-bordered w-full text-black"
                  value={selectedCollateralAsset}
                  onChange={(e) => setSelectedCollateralAsset(e.target.value as Address)}
                >
                  <option value="">Chọn collateral asset</option>
                  {collateralPositions.map(position => {
                    const reserve = reservesByAsset.get(position.asset);
                    const bonus = reserve ? bonusPercentFromRaw(reserve.liquidationBonus).toFixed(1) : "0.0";
                    return (
                      <option key={position.asset} value={position.asset}>
                        {displaySymbol(position.symbol)} (+{bonus}%)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-slate-300">Debt asset</label>
                <select
                  className="select select-bordered w-full text-black"
                  value={selectedDebtAsset}
                  onChange={(e) => setSelectedDebtAsset(e.target.value as Address)}
                >
                  <option value="">Chọn debt asset</option>
                  {debtPositions.map(position => (
                    <option key={position.asset} value={position.asset}>
                      {displaySymbol(position.symbol)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, color: "#cbd5e1" }}>
                  Số debt muốn thanh lý
                </label>
                <InputNumber
                  value={debtToCoverHuman}
                  onChange={(e: any) =>
                    setDebtToCoverHuman(
                      e.target.value
                    )
                  }
                />
                {liquidationQuote ? (
                  <div className={`rounded-2xl border p-4 ${liquidationQuote.isValid ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-200 font-semibold">Preview lợi nhuận gộp</span>
                      <span className={`text-sm font-medium ${liquidationQuote.isValid ? "text-emerald-300" : "text-rose-300"}`}>
                        {liquidationQuote.isValid ? "Hợp lệ" : "Chưa hợp lệ"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Close Factor</span>
                        <strong className="text-white">
                          {formatPercent(CLOSE_FACTOR * 100)}
                        </strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Max debt thanh lý</span>
                        <strong className="text-white">
                          {liquidationQuote.maxDebtAllowed.toFixed(2)}{" "}
                          {displaySymbol(selectedDebtReserve?.symbol ?? "")}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Collateral nhận về</span>
                        <strong className="text-white">
                          {liquidationQuote.collateralTokenNeeded.toFixed(6)} {displaySymbol(selectedCollateralPosition?.symbol ?? "")}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giá trị collateral</span>
                        <strong className="text-white">${liquidationQuote.collateralUsdNeeded.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bonus</span>
                        <strong className="text-amber-300">${liquidationQuote.bonusUsd.toFixed(2)} (+{liquidationQuote.bonusPct.toFixed(1)}%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lợi nhuận gộp dự kiến</span>
                        <strong className="text-emerald-300">${liquidationQuote.profitUsd.toFixed(2)}</strong>
                      </div>
                    </div>

                    {!liquidationQuote.isValid ? (
                      <p className="mt-3 text-sm text-rose-200">
                        {liquidationQuote.reason}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-slate-300">
                        Max cover theo collateral đã chọn: khoảng ${liquidationQuote.maxDebtByCollateralUsd.toFixed(2)}.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#cbd5e1",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={receiveAToken}
                  onChange={(e) => setReceiveAToken(e.target.checked)}
                />
                Nhận aToken thay vì collateral gốc
              </label>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button onClick={handleLiquidation} disabled={!canLiquidate || submitting}>
                  {submitting ? "Đang thanh lý..." : "Thanh lý"}
                </Button>
                <Button
                  onClick={() => {
                    setError("");
                    setStatus("");
                    setTxHash("");
                    setPreview(null);
                    setBorrower("");
                    setDebtToCoverHuman("0");
                    setReceiveAToken(false);
                    setReserves([]);
                    setBorrowerPositions([]);
                    setSelectedCollateralAsset("");
                    setSelectedDebtAsset("");
                  }}
                >
                  Reset
                </Button>

              </div>

              {status ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    color: "#a7f3d0",
                    lineHeight: 1.6,
                  }}
                >
                  {status}
                </div>
              ) : null}

              {error ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#fecaca",
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                  }}
                >
                  {error}
                </div>
              ) : null}

              {txHash ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#bfdbfe",
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                  }}
                >
                  Tx hash: {txHash}
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section
          style={{
            marginTop: 20,
            background: "rgba(15,23,42,0.92)",
            border: "1px solid rgba(148,163,184,0.18)",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.24)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>
            Gợi ý dùng nhanh
          </h2>
          <div style={{ display: "grid", gap: 8, color: "#cbd5e1", lineHeight: 1.7 }}>
            <div>1. Nhập địa chỉ người vay.</div>
            <div>2. Bấm “Lấy dữ liệu vị thế” để kiểm tra Health Factor.</div>
            <div>3. Điền collateral asset và debt asset đúng với vị thế cần thanh lý.</div>
            <div>4. Nhập số lượng debt muốn cover theo đơn vị gốc của token debt.</div>
            <div>5. Bấm “Thanh lý”. UI sẽ tự approve rồi gọi liquidationCall.</div>
          </div>
        </section>
        <section
          style={{
            marginTop: 20,
          }}
        >
          <LiquidationOpportunitiesTable
            candidates={opportunities}
            loading={loadingOpportunities}
            onRefresh={() => void loadOpportunities()}
            onSelect={(address) => {
              void handleSelectOpportunity(
                address as `0x${string}`,
              );
            }}
          />
        </section>
      </div>
    </div>
  );
}