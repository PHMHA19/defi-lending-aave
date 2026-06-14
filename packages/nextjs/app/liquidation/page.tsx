"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { isAddress, getAddress, type Address } from "viem";
import {
  getLiquidationPreview,
  isLiquidatable,
  liquidationCallAndWait,
  parseTokenAmount,
  formatHealthFactor,
} from "~~/services/aave/liquidation";
import { deployedContracts } from "~~/contracts/deployedContracts";
import { Input, InputNumber, Button } from "~~/components/AntdComponents";

type PreviewState = Awaited<ReturnType<typeof getLiquidationPreview>> | null;

function shortAddress(address: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function safeAddress(value: unknown): Address | "" {
  if (typeof value !== "string") return "";
  if (!isAddress(value)) return "";
  return getAddress(value);
}

export default function LiquidationPage() {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();

  const chainDeployment = useMemo(() => {
    const record = (deployedContracts as any)?.[chainId] ?? (deployedContracts as any)?.[31337] ?? {};
    return record;
  }, [chainId]);

  const defaultCollateral = useMemo(() => {
    return safeAddress(chainDeployment?.WETH ?? chainDeployment?.weth ?? chainDeployment?.collateralAsset);
  }, [chainDeployment]);

  const defaultDebt = useMemo(() => {
    return safeAddress(chainDeployment?.USDC ?? chainDeployment?.usdc ?? chainDeployment?.debtAsset);
  }, [chainDeployment]);

  const [borrower, setBorrower] = useState("");
  const [collateralAsset, setCollateralAsset] = useState<Address | "">(defaultCollateral);
  const [debtAsset, setDebtAsset] = useState<Address | "">(defaultDebt);
  const [debtToCoverHuman, setDebtToCoverHuman] = useState("0");
  const [receiveAToken, setReceiveAToken] = useState(false);

  const [preview, setPreview] = useState<PreviewState>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const canPreview = isAddress(borrower);
  const canLiquidate =
    isAddress(borrower) &&
    isAddress(collateralAsset) &&
    isAddress(debtAsset) &&
    Number(debtToCoverHuman) > 0 &&
    (!preview || preview.isLiquidatable || isLiquidatable(preview.accountData.healthFactor));

  const fillDefaults = () => {
    if (defaultCollateral) setCollateralAsset(defaultCollateral);
    if (defaultDebt) setDebtAsset(defaultDebt);
    setStatus("Đã nạp địa chỉ mặc định từ deployedContracts.");
    setError("");
  };

  const handleLoadPreview = async () => {
    setError("");
    setStatus("");

    if (!isAddress(borrower)) {
      setPreview(null);
      setError("Địa chỉ người vay không hợp lệ.");
      return;
    }

    try {
      setLoadingPreview(true);
      const data = await getLiquidationPreview(getAddress(borrower), chainId);
      setPreview(data);
      setStatus(
        data.isLiquidatable
          ? "Vị thế đủ điều kiện thanh lý."
          : "Vị thế chưa đủ điều kiện thanh lý."
      );
    } catch (e) {
      console.error(e);
      setPreview(null);
      setError("Không thể lấy dữ liệu vị thế. Kiểm tra địa chỉ, chainId và deployedContracts.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleLiquidation = async () => {
    setError("");
    setStatus("");
    setTxHash("");

    if (!isAddress(borrower)) {
      setError("Địa chỉ người vay không hợp lệ.");
      return;
    }
    if (!isAddress(collateralAsset)) {
      setError("Địa chỉ collateral asset không hợp lệ.");
      return;
    }
    if (!isAddress(debtAsset)) {
      setError("Địa chỉ debt asset không hợp lệ.");
      return;
    }

    const amountNumber = Number(debtToCoverHuman);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Số tiền thanh lý phải lớn hơn 0.");
      return;
    }

    try {
      setSubmitting(true);

      const debtAmount = await parseTokenAmount(debtToCoverHuman, getAddress(debtAsset), chainId);

      const receipt = await liquidationCallAndWait({
        collateralAsset: getAddress(collateralAsset),
        debtAsset: getAddress(debtAsset),
        user: getAddress(borrower),
        debtToCover: debtAmount,
        receiveAToken,
        chainId,
      });

      const hash =
        typeof receipt?.transactionHash === "string"
          ? receipt.transactionHash
          : typeof receipt?.hash === "string"
            ? receipt.hash
            : "";

      if (hash) setTxHash(hash);
      setStatus("Thanh lý thành công.");

      await handleLoadPreview();
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
                  onBlur={handleLoadPreview}
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button type="primary" onClick={handleLoadPreview} disabled={!canPreview || loadingPreview}>
                  {loadingPreview ? "Đang tải..." : "Lấy dữ liệu vị thế"}
                </Button>
                <Button type="default" onClick={fillDefaults}>
                  Nạp WETH / USDC mặc định
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
                <label style={{ display: "block", marginBottom: 6, color: "#cbd5e1" }}>
                  Collateral asset
                </label>
                <Input
                  value={collateralAsset}
                  onChange={(e: any) => setCollateralAsset(e.target.value)}
                  placeholder="0x collateral token"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, color: "#cbd5e1" }}>
                  Debt asset
                </label>
                <Input
                  value={debtAsset}
                  onChange={(e: any) => setDebtAsset(e.target.value)}
                  placeholder="0x debt token"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, color: "#cbd5e1" }}>
                  Số debt muốn thanh lý
                </label>
                <InputNumber
                  value={debtToCoverHuman as any}
                  onChange={(value: any) => setDebtToCoverHuman(String(value ?? ""))}
                  placeholder="Ví dụ: 100.5"
                  style={{ width: "100%" }}
                />
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
                <Button
                  type="primary"
                  onClick={handleLiquidation}
                  disabled={!canLiquidate || submitting}
                >
                  {submitting ? "Đang thanh lý..." : "Thanh lý"}
                </Button>

                <Button
                  type="default"
                  onClick={() => {
                    setError("");
                    setStatus("");
                    setTxHash("");
                    setPreview(null);
                    setBorrower("");
                    setDebtToCoverHuman("0");
                    setReceiveAToken(false);
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
      </div>
    </div>
  );
}