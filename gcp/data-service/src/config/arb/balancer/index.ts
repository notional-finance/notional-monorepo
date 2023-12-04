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
].flatMap((_) => _);
