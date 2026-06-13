
type Props = {
  symbol: string;
};

const tokenIcons:
  Record<
    string,
    string
  > = {

  WETH:
    "🟣",

  wstETH:
    "🔵",

  WBTC:
    "🟠",

  USDC:
    "💙",

  DAI:
    "🟡",

  LINK:
    "🔗",

  AAVE:
    "👻",

  cbETH:
    "🔷",
};

export function
TokenIcon({
  symbol,
}: Props) {

  return (
    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg border border-slate-600">
      {
        tokenIcons[
          symbol
        ] || "🪙"
      }
    </div>
  );
}

