
export function formatRay(
  value: bigint,
) {
  return Number(value) / 1e27;
}

export function formatAPY(
  value: bigint,
) {
  return (
    Number(value) / 1e25
  ).toFixed(2);
}

export function formatHealthFactor(
  value: bigint,
) {
  /**
   * Aave returns max uint
   * when no debt exists
   */
  if (
    value >
    10n ** 30n
  ) {
    return "∞";
  }

  return (
    Number(value) /
    1e18
  ).toFixed(2);
}

export function formatLTV(
  value: bigint,
) {
  return (
    Number(value) / 100
  ).toFixed(2);
}

export function formatUSD(
  value: bigint,
) {
  return (
    Number(value) / 1e8
  ).toFixed(2);
}

export function formatTokenAmount(
  value: bigint,
  decimals: number,
) {
  return (
    Number(value) /
    10 ** decimals
  ).toFixed(4);
}

