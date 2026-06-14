"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getUserAccountData, liquidationCall } from "~~/services/aave/liquidation";
import { useAccount } from "wagmi";
import { Input, InputNumber, Button } from "~~/components/AntdComponents";
import { deployedContracts } from "~~/contracts/deployedContracts";

export default function LiquidationPage() {
  const [targetUser, setTargetUser] = useState<string>("");
  const [healthFactor, setHealthFactor] = useState<string>("0");
  const [totalCollateral, setTotalCollateral] = useState<string>("0");
  const [totalDebt, setTotalDebt] = useState<string>("0");
  const [debtToCover, setDebtToCover] = useState<number>(0);

  const chainId = 31337; // thay đúng chain ID cần dùng
  const WETH = (deployedContracts as any)[chainId].WETH as string;
  const USDC = (deployedContracts as any)[chainId].USDC as string;

  // Lấy dữ liệu vị thế khi nhập địa chỉ user
  const fetchUserData = async () => {
    if (!targetUser) return;
    const data: any = await getUserAccountData(targetUser);
    // Chuyển healthFactor từ uint (ray) sang số thập phân
    const hf = ethers.utils.formatUnits(data.healthFactor, 18);
    const collateral = ethers.utils.formatUnits(data.totalCollateralBase, 18);
    const debt = ethers.utils.formatUnits(data.totalDebtBase, 18);
    setHealthFactor(hf);
    setTotalCollateral(collateral);
    setTotalDebt(debt);
  };

  // Xử lý thanh lý khi người dùng bấm nút
  const handleLiquidation = async () => {
    if (!targetUser || debtToCover <= 0) return;
    const amountWei = ethers.utils.parseUnits(debtToCover.toString(), 18);
    // Gọi liquidationCall từ service
    const tx = await liquidationCall(
      WETH,
      USDC,
      targetUser,
      amountWei,
      false
    );
    await tx.wait();
    alert("Thanh lý đã gửi giao dịch");
    // Có thể gọi lại fetchUserData để cập nhật dữ liệu sau thanh lý
    fetchUserData();
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Trang Thanh Lý Nợ</h2>
      <Input
        value={targetUser}
        onChange={(e) => setTargetUser(e.target.value)}
        placeholder="Địa chỉ người vay"
        onBlur={fetchUserData}
      />
      <div style={{ marginTop: 10 }}>
        <p>Health Factor: {healthFactor}</p>
        <p>Tổng Collateral (WETH): {totalCollateral}</p>
        <p>Tổng Debt (USDC): {totalDebt}</p>
      </div>
      <InputNumber
        value={debtToCover}
        onChange={(value) => setDebtToCover(value as number)}
        placeholder="Số USDC muốn trả"
        style={{ marginTop: 10, width: '100%' }}
      />
      <Button
        type="primary"
        onClick={handleLiquidation}
        disabled={Number(healthFactor) >= 1 || debtToCover <= 0}
        style={{ marginTop: 10 }}
      >
        {Number(healthFactor) < 1 ? "Thanh lý" : "Vị thế còn an toàn"}
      </Button>
    </div>
  );
}
