import {
  getComposablePoolConfig,
  getComposablePoolConfigNoAura,
} from './ComposablePoolConfig';
import { Network } from '@notional-finance/util';
import { SourceType, Strategy, TableName } from '../../types';
import {
  IAggregatorABI,
  ISingleSidedLPStrategyVaultABI,
  ISingleSidedLPStrategyVault,
} from '@notional-finance/contracts';
import { ArbTokenConfig, EthTokenConfig, getOracleValue } from '..';

export const Balancer_Config = [
  getComposablePoolConfig(
    '0xd0ec47c54ca5e20aaae4616c25c825c7f48d40690000000000000000000004ef',
    '0xd0ec47c54ca5e20aaae4616c25c825c7f48d4069',
    '0x8ba2d53f34159c5c5e7add60b56c7de3bbc1da68',
    '0xf8A95653CC7ee59AfA2304DcC518c431a15C292C',
    Network.arbitrum,
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
        network: Network.mainnet,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496',
    '0x423a1323c871abc9d89eb06855bf5347048fc4a5',
    '0xa14453084318277b11d38fbe05d857a4f647442b',
    '0xbb1a15dfd849bc5a6f33c002999c8953afa626ad',
    Network.arbitrum,
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
    Network.arbitrum,
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
        network: Network.mainnet,
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
        network: Network.arbitrum,
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
        network: Network.arbitrum,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498',
    '0x9791d590788598535278552eecd4b211bfc790cb',
    '0x260cbb867359a1084eC97de4157d06ca74e89415',
    '0xb6d101874b975083c76598542946fe047f059066',
    Network.arbitrum,
    Strategy.Arb_Balancer_wstETH_WETH,
    [ArbTokenConfig['wstETH'], ArbTokenConfig['WETH']],
    [
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2',
          contractABI: ISingleSidedLPStrategyVaultABI,
          method: 'getStrategyVaultInfo',
          transform: (
            r: Awaited<
              ReturnType<ISingleSidedLPStrategyVault['getStrategyVaultInfo']>
            >
          ) => {
            return r.totalLPTokens;
          },
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_wstETH_WETH,
          variable: 'Total LP Tokens',
          decimals: 18,
        },
        network: Network.arbitrum,
      },
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2',
          contractABI: ISingleSidedLPStrategyVaultABI,
          method: 'getStrategyVaultInfo',
          transform: (
            r: Awaited<
              ReturnType<ISingleSidedLPStrategyVault['getStrategyVaultInfo']>
            >
          ) => {
            return r.totalVaultShares;
          },
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Arb_Balancer_wstETH_WETH,
          variable: 'Total Vault Shares',
          decimals: 8,
        },
        network: Network.arbitrum,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003bd',
    '0x32df62dc3aed2cd6224193052ce665dc18165841',
    '0xcf9f895296F5e1D66a7D4dcf1d92e1B435E9f999',
    '0x8135d6abfd42707a87a7b94c5cfa3529f9b432ad',
    Network.arbitrum,
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
        network: Network.arbitrum,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x8353157092ed8be69a9df8f95af097bbf33cb2af0000000000000000000005d9',
    '0x8353157092ed8be69a9df8f95af097bbf33cb2af',
    '0xf720e9137baa9C7612e6CA59149a5057ab320cFa',
    '0xf720e9137baa9C7612e6CA59149a5057ab320cFa',
    Network.mainnet,
    Strategy.Eth_Balancer_USDC_GHO_USDT,
    [EthTokenConfig['USDC'], EthTokenConfig['GHO'], EthTokenConfig['USDT']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_USDC_GHO_USDT,
        'GHO to USD Price',
        '0x3f12643D3f6f874d39C2a4c9f2Cd6f2DbAC877FC'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_USDC_GHO_USDT,
        'USDC to USD Price',
        '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_USDC_GHO_USDT,
        'USDT to USD Price',
        '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D'
      ),
    ]
  ),
  getComposablePoolConfig(
    '0x05ff47afada98a98982113758878f9a8b9fdda0a000000000000000000000645',
    '0x05ff47afada98a98982113758878f9a8b9fdda0a',
    '0xC859BF9d7B8C557bBd229565124c2C09269F3aEF',
    '0xC859BF9d7B8C557bBd229565124c2C09269F3aEF',
    Network.mainnet,
    Strategy.Eth_Balancer_rETH_weETH,
    [EthTokenConfig['rETH'], EthTokenConfig['weETH']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_rETH_weETH,
        'rETH to ETH Price',
        '0x536218f9E9Eb48863970252233c8F271f554C2d0'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_rETH_weETH,
        'weETH to ETH Price',
        '0x8751F736E94F6CD167e8C5B97E245680FbD9CC36'
      ),
      {
        sourceType: SourceType.Multicall,
        sourceConfig: {
          contractAddress: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
          contractABI: [
            {
              inputs: [],
              name: 'getRate',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          method: 'getRate',
        },
        tableName: TableName.GenericData,
        dataConfig: {
          strategyId: Strategy.Eth_Balancer_rETH_weETH,
          variable: 'eETH to weETH Rate',
          decimals: 18,
        },
        network: Network.mainnet,
      },
    ]
  ),
  getComposablePoolConfig(
    '0x596192bb6e41802428ac943d2f1476c1af25cc0e000000000000000000000659',
    '0x596192bb6e41802428ac943d2f1476c1af25cc0e',
    '0xa8B309a75f0D64ED632d45A003c68A30e59A1D8b',
    '0xa8B309a75f0D64ED632d45A003c68A30e59A1D8b',
    Network.mainnet,
    Strategy.Eth_Balancer_ezETH_WETH,
    [EthTokenConfig['ezETH'], EthTokenConfig['WETH']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_ezETH_WETH,
        'ezETH to ETH Price',
        '0xF4a3e183F59D2599ee3DF213ff78b1B3b1923696'
      ),
    ]
  ),
  getComposablePoolConfig(
    '0xb61371ab661b1acec81c699854d2f911070c059e000000000000000000000516',
    '0xb61371ab661b1acec81c699854d2f911070c059e',
    '0x7c4a6b0c16ca99e65822cc531403ce2f8a20a912',
    '0xcd41bc6dc6e9821c4c36848ff3397493e458a5d1',
    Network.arbitrum,
    Strategy.Arb_Balancer_ezETH_wstETH,
    [ArbTokenConfig['ezETH'], ArbTokenConfig['wstETH']],
    [
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Balancer_ezETH_wstETH,
        'ezETH to ETH Price',
        '0x11E1836bFF2ce9d6A5bec9cA79dc998210f3886d'
      ),
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Balancer_ezETH_wstETH,
        'wstETH to ETH Price',
        '0x8910333436c7FD1fEa39e8Aef3264471755772F8'
      ),
    ]
  ),
  getComposablePoolConfigNoAura(
    '0x58aadfb1afac0ad7fca1148f3cde6aedf5236b6d00000000000000000000067f',
    '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D',
    Network.mainnet,
    Strategy.Eth_Balancer_rsETH_WETH,
    [EthTokenConfig['rsETH'], EthTokenConfig['WETH']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Balancer_rsETH_WETH,
        'rsETH to ETH Price',
        '0x03c68933f7a3F76875C0bc670a58e69294cDFD01'
      ),
    ]
  ),
  getComposablePoolConfig(
    '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c',
    '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    '0x59907f88C360D576Aa38dba84F26578367F96b6C',
    '', // No Gauge Address
    Network.arbitrum,
    Strategy.Arb_Balancer_rsETH_WETH,
    [ArbTokenConfig['rsETH'], ArbTokenConfig['WETH']],
    [
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Balancer_ezETH_wstETH,
        'rsETH to ETH Price',
        '0x11E1836bFF2ce9d6A5bec9cA79dc998210f3886d'
      ),
    ]
  ),
].flatMap((_) => _);
