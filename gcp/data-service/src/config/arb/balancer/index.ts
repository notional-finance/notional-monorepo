import { getComposablePoolConfig } from './ComposablePoolConfig';
import { Network } from '@notional-finance/util';
import { SourceType, Strategy, TableName } from '../../../types';
import { IAggregatorABI } from '@notional-finance/contracts';

export const Arb_Balancer_Config = [
  getComposablePoolConfig(
    '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497',
    '0xade4a71bb62bec25154cfc7e6ff49a513b491e81',
    '0xd6B875d62c2661eaB66472F36c672e4B512f1135',
    '0x00b9bcd17cB049739D25FD7f826caA2E23b05620',
    Network.ArbitrumOne,
    Strategy.Arb_Balancer_rETH_WETH,
    // TODO: create constants for tokens
    [
      {
        address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        symbol: 'WETH',
        decimals: 18,
      },
      {
        address: '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8',
        symbol: 'rETH',
        decimals: 18,
      },
    ],
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
].flatMap((_) => _);
