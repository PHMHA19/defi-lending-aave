import deployedContracts from "~~/contracts/deployedContracts";

const chainId = 11155111;

export const AAVE_POOL_ADDRESSES_PROVIDER =
  deployedContracts[chainId]
    .PoolAddressesProvider
    .address;

export const AAVE_ORACLE =
  deployedContracts[chainId]
    .AaveOracle.address;

export const AAVE_POOL_DATA_PROVIDER =
  deployedContracts[chainId]
    .AaveProtocolDataProvider
    .address;

export const AAVE_UI_POOL_DATA_PROVIDER =
  "0x0000000000000000000000000000000000000000";

export const AAVE_WETH_GATEWAY =
  "0x0000000000000000000000000000000000000000";