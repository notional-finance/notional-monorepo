import { getComposablePoolConfig } from './ComposablePoolConfig';
import { Network } from '@notional-finance/util';
import { SourceType, Strategy, TableName } from '../../../types';
import { IAggregatorABI } from '@notional-finance/contracts';
import { ArbTokenConfig } from '..';

export const Arb_Balancer_Config = [
  getComposablePoolConfig(
    '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497',
    '0xade4a71bb62bec25154cfc7e6ff49a513b491e81',
    '0xd6B875d62c2661eaB66472F36c672e4B512f1135',
    '0x00b9bcd17cB049739D25FD7f826caA2E23b05620',
    Network.ArbitrumOne,
    Strategy.Arb_Balancer_rETH_WETH,
    [ArbTokenConfig['WETH'], ArbTokenConfig['rETH']],
    [
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0x536218f9e9eb48863970252233c8f271f554c2d0',
          contractABI: IAggregatorABI,
          method: 'latestAnswer',
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_rETH_WETH,
          variable: 'rETH to USD oracle',
          decimals: 18,
        },
        // NOTE: this is always on mainnet
        network: Network.Mainnet,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496',
    '0x423a1323c871abc9d89eb06855bf5347048fc4a5',
    '0xa14453084318277b11d38fbe05d857a4f647442b',
    '0xbb1a15dfd849bc5a6f33c002999c8953afa626ad',
    Network.ArbitrumOne,
    Strategy.Arb_Balancer_USDC_USDC_e_DAI_USDT,
    [
      ArbTokenConfig['USDC'],
      ArbTokenConfig['USDC_e'],
      ArbTokenConfig['DAI'],
      ArbTokenConfig['USDT'],
    ]
  ),
  getComposablePoolConfig(
    '0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481',
    '0x4a2f6ae7f3e5d715689530873ec35593dc28951b',
    '0x2eb5661002b68ebe887d29d415c3a3b52536912c',
    '0x56c0626e6e3931af90ebb679a321225180d4b32b',
    Network.ArbitrumOne,
    Strategy.Arb_Balancer_wstETH_rETH_cbETH,
    [ArbTokenConfig['wstETH'], ArbTokenConfig['rETH'], ArbTokenConfig['cbETH']],
    [
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0x536218f9e9eb48863970252233c8f271f554c2d0',
          contractABI: IAggregatorABI,
          method: 'latestAnswer',
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_wstETH_rETH_cbETH,
          variable: 'rETH to USD oracle',
          decimals: 18,
        },
        // NOTE: this is always on mainnet
        network: Network.Mainnet,
      },
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0xb523ae262d20a936bc152e6023996e46fdc2a95d',
          contractABI: IAggregatorABI,
          method: 'latestAnswer',
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_wstETH_rETH_cbETH,
          variable: 'wstETH to ETH oracle',
          decimals: 18,
        },
        network: Network.ArbitrumOne,
      },
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0xa668682974e3f121185a3cd94f00322bec674275',
          contractABI: IAggregatorABI,
          method: 'latestAnswer',
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_wstETH_rETH_cbETH,
          variable: 'cbETH to ETH oracle',
          decimals: 18,
        },
        network: Network.ArbitrumOne,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498',
    '0x9791d590788598535278552eecd4b211bfc790cb',
    '0x260cbb867359a1084eC97de4157d06ca74e89415',
    '0xb6d101874b975083c76598542946fe047f059066',
    Network.ArbitrumOne,
    Strategy.Arb_Balancer_wstETH_WETH,
    [ArbTokenConfig['wstETH'], ArbTokenConfig['WETH']]
  ),
  getComposablePoolConfig(
    '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003bd',
    '0x32df62dc3aed2cd6224193052ce665dc18165841',
    '0xcf9f895296F5e1D66a7D4dcf1d92e1B435E9f999',
    '0x8135d6abfd42707a87a7b94c5cfa3529f9b432ad',
    Network.ArbitrumOne,
    Strategy.Arb_Balancer_RDNT_WETH,
    [ArbTokenConfig['RDNT'], ArbTokenConfig['WETH']],
    [
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0x20d0fcab0ecfd078b036b6caf1fac69a6453b352',
          contractABI: IAggregatorABI,
          method: 'latestAnswer',
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_RDNT_WETH,
          variable: 'RDNT to USD oracle',
          decimals: 18,
        },
        network: Network.ArbitrumOne,
      },
    ]
  ),
].flatMap((_) => _);
