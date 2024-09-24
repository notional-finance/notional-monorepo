import { Network } from '@notional-finance/util';
import { ConfigDefinition, SourceType, Strategy, TableName } from '../types';
import { IAggregatorABI } from '@notional-finance/contracts';

export const ArbTokenConfig = {
  WETH: {
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    symbol: 'WETH',
    decimals: 18,
  },
  FRAX: {
    address: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
    symbol: 'FRAX',
    decimals: 18,
  },
  rETH: {
    address: '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8',
    symbol: 'rETH',
    decimals: 18,
  },
  USDC: {
    address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    symbol: 'USDC',
    decimals: 6,
  },
  USDC_e: {
    address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    symbol: 'USDC.e',
    decimals: 6,
  },
  USDT: {
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    symbol: 'USDT',
    decimals: 6,
  },
  DAI: {
    address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    symbol: 'DAI',
    decimals: 18,
  },
  wstETH: {
    address: '0x5979d7b546e38e414f7e9822514be443a4800529',
    symbol: 'wstETH',
    decimals: 18,
  },
  cbETH: {
    address: '0x1debd73e752beaf79865fd6446b0c970eae7732f',
    symbol: 'cbETH',
    decimals: 18,
  },
  RDNT: {
    address: '0x3082cc23568ea640225c2467653db90e9250aaa0',
    symbol: 'RDNT',
    decimals: 18,
  },
  crvUSD: {
    address: '0x0a32255dd4BB6177C994bAAc73E0606fDD568f66',
    symbol: 'crvUSD',
    decimals: 18,
  },
  ezETH: {
    address: '0x2416092f143378750bb29b79eD961ab195CcEea5',
    symbol: 'ezETH',
    decimals: 18,
  },
  WBTC: {
    address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    symbol: 'WBTC',
    decimals: 8,
  },
  tBTC: {
    address: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
    symbol: 'tBTC',
    decimals: 18,
  },
  rsETH: {
    address: '0x4186bfc76e2e237523cbc30fd220fe055156b41f',
    symbol: 'rsETH',
    decimals: 18,
  },
} as const;

export const EthTokenConfig = {
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
  },
  rETH: {
    address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    symbol: 'rETH',
    decimals: 18,
  },
  weETH: {
    address: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
    symbol: 'weETH',
    decimals: 18,
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
  },
  pyUSD: {
    address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    symbol: 'pyUSD',
    decimals: 6,
  },
  crvUSD: {
    address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    symbol: 'crvUSD',
    decimals: 18,
  },
  GHO: {
    address: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    symbol: 'GHO',
    decimals: 18,
  },
  ezETH: {
    address: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    symbol: 'ezETH',
    decimals: 18,
  },
  USDe: {
    address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    symbol: 'USDe',
    decimals: 18,
  },
  rsETH: {
    address: '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
    symbol: 'rsETH',
    decimals: 18,
  },
} as const;

export function getOracleValue(
  network: Network,
  strategyId: Strategy,
  name: string,
  oracleAddress: string
): ConfigDefinition {
  return {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: oracleAddress,
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId,
      variable: name,
      decimals: 18,
    },
    network,
  };
}
