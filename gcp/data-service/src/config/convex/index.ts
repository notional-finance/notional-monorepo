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
    '0xec090cf6dd891d2d014bea6edada6e05e025d93d',
    '0xb12600d06753df7c706225c901e6c1346a654d0b',
    Network.arbitrum,
    Strategy.Arb_Convex_crvUSD_USDC,
    [ArbTokenConfig['USDC'], ArbTokenConfig['crvUSD']],
    [
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Convex_crvUSD_USDC,
        'USDC to USD Price',
        '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3'
      ),
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Convex_crvUSD_USDC,
        'crvUSD to USD Price',
        '0x0a32255dd4BB6177C994bAAc73E0606fDD568f66'
      ),
    ]
  ),
  getCurveV1PoolConfig(
    '0x73af1150f265419ef8a5db41908b700c32d49135',
    '0xb12600d06753df7c706225c901e6c1346a654d0b',
    Network.arbitrum,
    Strategy.Arb_Convex_crvUSD_USDT,
    [ArbTokenConfig['USDT'], ArbTokenConfig['crvUSD']],
    [
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Convex_crvUSD_USDT,
        'USDT to USD Price',
        '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7'
      ),
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Convex_crvUSD_USDT,
        'crvUSD to USD Price',
        '0x0a32255dd4BB6177C994bAAc73E0606fDD568f66'
      ),
    ]
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
  getCurveV1PoolConfig(
    '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
    '0x04e80db3f84873e4132b221831af1045d27f140f',
    Network.mainnet,
    Strategy.Eth_Curve_USDe_USDC,
    [EthTokenConfig['USDC'], EthTokenConfig['USDe']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Curve_USDe_USDC,
        'USDC to USD Price',
        '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Curve_USDe_USDC,
        'USDe to USD Price',
        '0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961'
      ),
    ]
  ),
  getCurveV1PoolConfig(
    '0x755D6688AD74661Add2FB29212ef9153D40fcA46',
    '0xd6dacdcb438f048cf90e53415872cdb3fcc95421',
    Network.arbitrum,
    Strategy.Arb_Convex_WBTC_tBTC,
    [ArbTokenConfig['WBTC'], ArbTokenConfig['tBTC']],
    [
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Convex_WBTC_tBTC,
        'WBTC to USD Price',
        '0xd0C7101eACbB49F3deCcCc166d238410D6D46d57'
      ),
      getOracleValue(
        Network.arbitrum,
        Strategy.Arb_Convex_WBTC_tBTC,
        'tBTC to USD Price',
        '0xE808488e8627F6531bA79a13A9E0271B39abEb1C'
      ),
    ]
  ),
  getCurveV1PoolConfig(
    '0x635EF0056A597D13863B73825CcA297236578595',
    '0x4717c25df44e280ec5b31acbd8c194e1ed24efe2',
    Network.mainnet,
    Strategy.Eth_Convex_GHO_crvUSD,
    [EthTokenConfig['GHO'], EthTokenConfig['crvUSD']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_GHO_crvUSD,
        'GHO to USD Price',
        '0x3f12643D3f6f874d39C2a4c9f2Cd6f2DbAC877FC'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Convex_GHO_crvUSD,
        'crvUSD to USD Price',
        '0xEEf0C605546958c1f899b6fB336C20671f9cD49F'
      ),
    ]
  ),
  getCurveV1PoolConfig(
    '0x670a72e6D22b0956C0D2573288F82DCc5d6E3a61',
    '0x8ed00833be7342608fafdbf776a696afbfeaae96',
    Network.mainnet,
    Strategy.Eth_Curve_GHO_USDe,
    [EthTokenConfig['GHO'], EthTokenConfig['USDe']],
    [
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Curve_GHO_USDe,
        'GHO to USD Price',
        '0x3f12643D3f6f874d39C2a4c9f2Cd6f2DbAC877FC'
      ),
      getOracleValue(
        Network.mainnet,
        Strategy.Eth_Curve_GHO_USDe,
        'USDe to USD Price',
        '0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961'
      ),
    ]
  ),
].flatMap((_) => _);
