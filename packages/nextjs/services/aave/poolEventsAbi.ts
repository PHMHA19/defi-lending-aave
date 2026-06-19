export const poolEventsAbi = [
  {
    type: "event",
    name: "Borrow",
    inputs: [
      { name: "reserve", type: "address", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "onBehalfOf", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "interestRateMode", type: "uint8", indexed: false },
      { name: "borrowRate", type: "uint256", indexed: false },
      { name: "referralCode", type: "uint16", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Repay",
    inputs: [
      { name: "reserve", type: "address", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "repayer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "useATokens", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Supply",
    inputs: [
      { name: "reserve", type: "address", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "onBehalfOf", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "referralCode", type: "uint16", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdraw",
    inputs: [
      { name: "reserve", type: "address", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "LiquidationCall",
    inputs: [
      { name: "collateralAsset", type: "address", indexed: true },
      { name: "debtAsset", type: "address", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "debtToCover", type: "uint256", indexed: false },
      { name: "receiveAToken", type: "bool", indexed: false },
    ],
  },
] as const;