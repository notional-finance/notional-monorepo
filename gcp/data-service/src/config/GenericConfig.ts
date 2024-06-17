import {
  BalancerBoostedPoolABI,
  wstETHABI,
  cbETHABI,
  rETHABI,
  BalancerStablePoolABI,
  ERC20ABI,
  IAggregatorABI,
  Multicall3ABI,
} from '@notional-finance/contracts';
import { ethers } from 'ethers';
import { Network } from '@notional-finance/util';
import { ConfigDefinition, SourceType, TableName, Strategy } from '../types';

export const configDefs: ConfigDefinition[] = [
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      contractABI: wstETHABI,
      method: 'getStETHByWstETH',
      args: [ethers.utils.parseEther('1')],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'stETH to wstETH ratio',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
      contractABI: cbETHABI,
      method: 'exchangeRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'ETH to cbETH ratio',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xae78736cd615f374d3085123a210448e74fc6393',
      contractABI: rETHABI,
      method: 'getExchangeRate',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'ETH to rETH ratio',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcbfa4532d8b2ade2c261d3dd5ef2a2284f792692',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 17971301,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Usdc Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xa1697f9af0875b63ddc472d6eebada8c1fab8568',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 17971301,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Usdt Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x6667c6fa9f2b3fc1cc8d85320b62703d938e4385',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 17971301,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Dai Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x60d604890feaa0b5460b28a424407c24fe89374a',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 17971301,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Weth Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x7c82a23b4c48d796dee36a9ca215b641c6a8709d',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 123907076,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Usdc Exchange Rate - Arbitrum',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x4739E50B59B552D490d3FDc60D200977A38510c0',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 123907076,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Usdt Exchange Rate - Arbitrum',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x9e34631547adcf2f8cefa0f5f223955c7b137571',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 123907076,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Dai Exchange Rate - Arbitrum',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xda1cd1711743e57dd57102e9e61b75f3587703da',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
      finalBlock: 123907076,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'bb-a-Weth Exchange Rate - Arbitrum',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Weth To Usdc Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Weth To Bal Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xc29562b045d80fd77c69bec09541f5c16fe20d9d',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Aura To Weth Exchange Rate',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Usdc To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x3e7d1eab13ad0104d2750b8863b489d65364e32d',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Usdt To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Dai To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Eth To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xf0b7159bbfc341cc41e7cb182216f62c6d40533d',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Rpl To Usd Oracle',
      decimals: 8,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x4e844125952d32acdf339be976c98e22f6f318db',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Ldo To Eth Oracle',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x761aaebf021f19f198d325d7979965d0c7c9e53b',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Ohmv2 To Usd Oracle',
      decimals: 8,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x0411d28c94d85a36bc72cb0f875dfa8371d8ffff',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Lusd To Usd Oracle',
      decimals: 8,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xb9e1e3a9feff48998e45fa90847ed4d467e8bcfd',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Frax To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xd962fc30a72a84ce50161031391756bf2876af5d',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Cvx To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcd627aa160a6fa45eb793d19ef54f5062f20f33f',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Crv To Usd Oracle',
      decimals: 8,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xb2a824043730fe05f3da2efafa1cbbe83fa548d6',
      contractABI: IAggregatorABI,
      method: 'latestAnswer',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Arb To Usd Oracle',
      decimals: 8,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xC128a9954e6c874eA3d62ce62B468bA073093F25',
      contractABI: ERC20ABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'veBAL total supply',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xC128a9954e6c874eA3d62ce62B468bA073093F25',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Aura veBAL balance',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xba100000625a3754423978a60c9317c58a424e3D',
      contractABI: ERC20ABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Total BAL supply',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2',
      contractABI: ERC20ABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'veCRV total supply',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x989AEb4d175e16225E39E87d0D97A3360524AD80'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Convex veCRV balance',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
      contractABI: ERC20ABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'Cvx total supply',
      decimals: 18,
    },
    network: Network.mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      contractABI: Multicall3ABI,
      method: 'getEthBalance',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'ethProxyBalance',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'daiProxyBalance',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
      finalBlock: 132900685,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'usdcProxyBalance',
      decimals: 6,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
      firstBlock: 132900686,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'usdcProxyBalance',
      decimals: 6,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'wbtcProxyBalance',
      decimals: 8,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x5979D7b546E38E414F7E9822514be443A4800529',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'wstethProxyBalance',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'fraxProxyBalance',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'rethProxyBalance',
      decimals: 18,
    },
    network: Network.arbitrum,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      contractABI: ERC20ABI,
      method: 'balanceOf',
      args: ['0x1344A36A1B56144C3Bc62E7757377D288fDE0369'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Generic,
      variable: 'usdtProxyBalance',
      decimals: 6,
    },
    network: Network.arbitrum,
  },
];
