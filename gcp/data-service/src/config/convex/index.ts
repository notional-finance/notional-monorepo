import { Network } from '@notional-finance/util';
import { getCurveV1PoolConfig } from './ConvexPoolConfig';
import { ArbTokenConfig, EthTokenConfig, getOracleValue } from '..';
import { Strategy } from '../../types';

export const Curve_Config = [
  getCurveV1PoolConfig(
    '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
    '0xCE5F24B7A95e9cBa7df4B54E911B4A3Dc8CDAf6f',
    Network.arbitrum,
    Strategy.Arb_Convex_USDC_USDT,
    [ArbTokenConfig['USDC_e'], ArbTokenConfig['USDT']]
  ),
  getCurveV1PoolConfig(
    '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
    '0x95285Ea6fF14F80A2fD3989a6bAb993Bd6b5fA13',
    Network.arbitrum,
    Strategy.Arb_Convex_USDC_FRAX,
    [ArbTokenConfig['USDC_e'], ArbTokenConfig['FRAX']]
  ),
  getCurveV1PoolConfig(
    '0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E',
    '0x95f00391cB5EebCd190EB58728B4CE23DbFa6ac1',
    Network.mainnet,
    Strategy.Eth_Convex_USDC_crvUSD,
    [EthTokenConfig['USDC'], EthTokenConfig['crvUSD']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_USDC_crvUSD,
        'USDC to USD Price',
        '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_USDC_crvUSD,
        'crvUSD to USD Price',
        '0xEEf0C605546958c1f899b6fB336C20671f9cD49F'
      ),
    ]
  ),
  getCurveV1PoolConfig(
    '0x390f3595bca2df7d23783dfd126427cceb997bf4',
    '0x4e6bB6B7447B7B2Aa268C16AB87F4Bb48BF57939',
    Network.mainnet,
    Strategy.Eth_Convex_USDT_crvUSD,
    [EthTokenConfig['USDT'], EthTokenConfig['crvUSD']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_USDT_crvUSD,
        'USDT to USD Price',
        '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_USDT_crvUSD,
        'crvUSD to USD Price',
        '0xEEf0C605546958c1f899b6fB336C20671f9cD49F'
      ),
    ]
  ),
  getCurveV1PoolConfig(
    '0x383e6b4437b59fff47b619cba855ca29342a8559',
    '0x9da75997624c697444958aded6790bfca96af19a',
    Network.mainnet,
    Strategy.Eth_Convex_USDC_pyUSD,
    [EthTokenConfig['USDC'], EthTokenConfig['pyUSD']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_USDC_pyUSD,
        'USDC to USD Price',
        '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_USDC_pyUSD,
        'pyUSD to USD Price',
        '0x8f1dF6D7F2db73eECE86a18b4381F4707b918FB1'
      ),
    ]
  ),
].flatMap((_) => _);
