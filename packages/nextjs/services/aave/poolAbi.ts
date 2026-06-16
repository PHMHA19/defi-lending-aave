export const poolAbi = [
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getUserAccountData",
    stateMutability: "view",
    inputs: [
      {
        name: "user",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "totalCollateralBase",
        type: "uint256",
      },
      {
        name: "totalDebtBase",
        type: "uint256",
      },
      {
        name: "availableBorrowsBase",
        type: "uint256",
      },
      {
        name: "currentLiquidationThreshold",
        type: "uint256",
      },
      {
        name: "ltv",
        type: "uint256",
      },
      {
        name: "healthFactor",
        type: "uint256",
      },
    ],
  },
  

  {
    type: "function",
    name: "getReservesList",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address[]",
      },
    ],
  },
  
  {
    type: "function",

    name: "borrow",

    stateMutability:
      "nonpayable",

    inputs: [
      {
        name: "asset",

        type: "address",
      },

      {
        name: "amount",

        type: "uint256",
      },

      {
        name:
          "interestRateMode",

        type: "uint256",
      },

      {
        name:
          "referralCode",

        type: "uint16",
      },

      {
        name:
          "onBehalfOf",

        type: "address",
      },
    ],

    outputs: [],
  },

  {
    type: "function",

    name: "withdraw",

    stateMutability:
      "nonpayable",

    inputs: [
      {
        name: "asset",

        type: "address",
      },

      {
        name: "amount",

        type: "uint256",
      },

      {
        name: "to",

        type: "address",
      },
    ],

    outputs: [
      {
        type: "uint256",
      },
    ],
  },

  
  {
    type: "function",

    name: "repay",

    stateMutability:
      "nonpayable",

    inputs: [
      {
        name: "asset",

        type: "address",
      },

      {
        name: "amount",

        type: "uint256",
      },

      {
        name:
          "interestRateMode",

        type: "uint256",
      },

      {
        name:
          "onBehalfOf",

        type: "address",
      },
    ],

    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "liquidationCall",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "collateralAsset",
        type: "address",
      },
      {
        name: "debtAsset",
        type: "address",
      },
      {
        name: "user",
        type: "address",
      },
      {
        name: "debtToCover",
        type: "uint256",
      },
      {
        name: "receiveAToken",
        type: "bool",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setUserUseReserveAsCollateral",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "useAsCollateral",
        type: "bool",
      },
    ],
    outputs: [],
  },

] as const;
