
export const reserveAbi = [
  {
    type: "function",
    name: "getAllReservesTokens",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        components: [
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "tokenAddress",
            type: "address",
          },
        ],
        type: "tuple[]",
      },
    ],
  },
] as const;
