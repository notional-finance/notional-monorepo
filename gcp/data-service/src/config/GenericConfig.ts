import {
  BalancerBoostedPoolABI,
  wstETHABI,
  cbETHABI,
  rETHABI,
  BalancerStablePoolABI,
} from '@notional-finance/contracts';
import { ethers } from 'ethers';
import { Network } from '@notional-finance/util';
import { ConfigDefinition, SourceType, TableName, Strategy } from '../types';

export const configDefs: ConfigDefinition[] = [
  {
    strategyId: Strategy.Generic,
    variable: 'stETH to wstETH ratio',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      contractABI: wstETHABI,
      method: 'getStETHByWstETH',
      args: [ethers.utils.parseEther('1')],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'ETH to cbETH ratio',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
      contractABI: cbETHABI,
      method: 'exchangeRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'ETH to rETH ratio',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xae78736cd615f374d3085123a210448e74fc6393',
      contractABI: rETHABI,
      method: 'getExchangeRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Usdc Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcbfa4532d8b2ade2c261d3dd5ef2a2284f792692',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Usdt Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xa1697f9af0875b63ddc472d6eebada8c1fab8568',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Dai Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x6667c6fa9f2b3fc1cc8d85320b62703d938e4385',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Weth Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x60d604890feaa0b5460b28a424407c24fe89374a',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Usdc Exchange Rate - Arbitrum',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x7c82a23b4c48d796dee36a9ca215b641c6a8709d',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Usdt Exchange Rate - Arbitrum',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x4739E50B59B552D490d3FDc60D200977A38510c0',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Dai Exchange Rate - Arbitrum',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x9e34631547adcf2f8cefa0f5f223955c7b137571',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'bb-a-Weth Exchange Rate - Arbitrum',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xda1cd1711743e57dd57102e9e61b75f3587703da',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'Weth To Usdc Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'Weth To Bal Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    strategyId: Strategy.Generic,
    variable: 'Aura To Weth Exchange Rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xc29562b045d80fd77c69bec09541f5c16fe20d9d',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  // Usdc To Usd Oracle
  // Usdt To Usd Oracle
  // Dai To Usd Oracle
  // Eth To Usd Oracle
  // Rpl To Usd Oracle
  // Ldo To Eth Oracle
  // Ohmv2 To Usd Oracle
  // Lusd To Usd Oracle
  // Frax To Usd Oracle
  // Cvx To Usd Oracle
  // Crv To Usd Oracle

  // veBAL total supply
  // Aura veBAL balance
  // Total BAL supply
  // veCRV total supply
  // Convex veCRV balance
  // Cvx total supply
];
