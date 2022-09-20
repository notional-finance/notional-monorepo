import { BigNumber, ethers, VoidSigner } from 'ethers';
import { fetch as crossFetch } from 'cross-fetch';
import { SystemData } from '.';
import TypedBigNumber from '../libs/TypedBigNumber';
import GraphClient from './GraphClient';
import { Contracts } from '../libs/types';
import { ConfigKeys, getBlockchainData } from './sources/Blockchain';
import getUSDPriceData from './sources/ExchangeRate';
import { getSystemConfig } from './sources/Subgraph';
import { getTradingEstimates, NETWORKS } from './sources/ZeroExApi';
import { decodeSystemData, encodeSystemData, SystemData as _SystemData } from './encoding/SystemProto';

import IAggregatorABI from '.././abi/IAggregator.json';
import AssetRateAggregatorABI from '.././abi/AssetRateAggregator.json';
import ERC20ABI from '.././abi/ERC20.json';
import nTokenERC20ABI from '.././abi/nTokenERC20.json';
import Notional from '..';

export async function fetchAndEncodeSystem(
  graphClient: GraphClient,
  provider: ethers.providers.JsonRpcBatchProvider,
  contracts: Contracts,
  skipFetchSetup: boolean,
  exchangeRateApiKey: string,
  _usdExchangeRates?: Record<string, BigNumber>
) {
  const config = await getSystemConfig(graphClient);
  const { blockNumber, results } = await getBlockchainData(provider, contracts, config);
  const network = await provider.getNetwork();
  const networkName = network.name === 'homestead' ? 'mainnet' : network.name;
  const block = await provider.getBlock(blockNumber.toNumber());
  // Only refresh exchange rates if a value is not provided
  const usdExchangeRates = _usdExchangeRates ?? (await getUSDPriceData(exchangeRateApiKey, skipFetchSetup));
  // Currently hardcoded to mainnet
  const estimateResults = await getTradingEstimates(networkName as NETWORKS, skipFetchSetup);
  const tradingEstimates = estimateResults.reduce((obj, e) => {
    const o = obj;
    o[`${e.buyTokenAddress}:${e.sellTokenAddress}`] = {
      ...e,
      estimates: e.estimates.map((e) =>
        // Serialized TypedBigNumbers
        ({ ...e, sellAmount: e.sellAmount.toJSON(), buyAmount: e.buyAmount.toJSON() })
      ),
    };
    return o;
  }, {});

  const systemObject: _SystemData = {
    network: networkName,
    lastUpdateBlockNumber: block.number,
    lastUpdateTimestamp: block.timestamp,
    USDExchangeRates: usdExchangeRates,
    tradingEstimates,
    StakedNoteParameters: {
      poolId: results[ConfigKeys.sNOTE.POOL_ID],
      coolDownTimeInSeconds: results[ConfigKeys.sNOTE.COOL_DOWN_TIME_SECS],
      redeemWindowSeconds: results[ConfigKeys.sNOTE.REDEEM_WINDOW_SECONDS],
      ethBalance: results[ConfigKeys.sNOTE.POOL_TOKEN_BALANCES].ethBalance,
      noteBalance: results[ConfigKeys.sNOTE.POOL_TOKEN_BALANCES].noteBalance,
      balancerPoolTotalSupply: results[ConfigKeys.sNOTE.POOL_TOTAL_SUPPLY],
      sNOTEBptBalance: results[ConfigKeys.sNOTE.POOL_TOKEN_SHARE],
      swapFee: results[ConfigKeys.sNOTE.POOL_SWAP_FEE],
      sNOTETotalSupply: results[ConfigKeys.sNOTE.TOTAL_SUPPLY],
      noteETHOraclePrice: results[ConfigKeys.sNOTE.NOTE_ETH_ORACLE_PRICE],
    },
    currencies: config.reduce((obj, c) => {
      const ret = obj;
      ret[c.id] = c;
      return ret;
    }, {}),
    ethRateData: config.reduce((obj, c) => {
      const ret = obj;
      ret[c.id] = {
        ...c.ethExchangeRate,
        latestRate: c.id === 1 ? ethers.constants.WeiPerEther : results[ConfigKeys.ETH_EXCHANGE_RATE(c.id)],
      };
      return ret;
    }, {}),
    assetRateData: config.reduce((obj, c) => {
      const ret = obj;
      if (c.assetExchangeRate) {
        ret[c.id] = {
          ...c.assetExchangeRate,
          latestRate: results[ConfigKeys.ASSET_EXCHANGE_RATE(c.id)],
          annualSupplyRate: results[ConfigKeys.ASSET_ANNUAL_SUPPLY_RATE(c.id)],
        };
      }
      return ret;
    }, {}),
    nTokenData: config.reduce((obj, c) => {
      const ret = obj;
      if (c.nToken) {
        ret[c.id] = {
          ...c.nToken,
          ...results[ConfigKeys.NTOKEN_ACCOUNT(c.id)],
          ...results[ConfigKeys.NTOKEN_PORTFOLIO(c.id)],
          assetCashPV: results[ConfigKeys.NTOKEN_PRESENT_VALUE(c.id)],
        };
      }
      return ret;
    }, {}),
    cashGroups: config.reduce((obj, c) => {
      const ret = obj;
      if (c.cashGroup) {
        ret[c.id] = {
          ...c.cashGroup,
          markets: results[ConfigKeys.MARKETS(c.id)],
        };
      }
      return ret;
    }, {}),
    vaults: config.reduce((obj, c) => {
      const ret = obj;
      c.leveragedVaults.forEach((v) => {
        ret[v.vaultAddress] = v;
      });
      return ret;
    }, {}),
  };

  const binary = encodeSystemData(systemObject);
  const json = JSON.stringify(decodeSystemData(binary));
  return { binary, json };
}

function _getABI(name: string) {
  switch (name) {
    case 'ERC20':
      return ERC20ABI;
    case 'nTokenERC20':
      return nTokenERC20ABI;
    case 'IAggregator':
      return IAggregatorABI;
    case 'AssetRateAggregator':
      return AssetRateAggregatorABI;
    default:
      throw Error(`Unknown abi ${name}`);
  }
}

export async function fetchSystem(
  chainId: number,
  provider: ethers.providers.JsonRpcBatchProvider,
  exchangeRateApiKey: string,
  skipFetchSetup: boolean,
  _usdExchangeRates: Record<string, BigNumber>
) {
  const { addresses, graphEndpoint } = Notional.getChainConfig(chainId);

  const signer = new VoidSigner(ethers.constants.AddressZero, provider);
  const contracts = Notional.getContracts(addresses, signer);
  const graphClient = new GraphClient(graphEndpoint, 0, skipFetchSetup);

  const result = await fetchAndEncodeSystem(
    graphClient,
    provider,
    contracts,
    skipFetchSetup,
    exchangeRateApiKey,
    _usdExchangeRates
  );
  return result;
}

function _decodeValue(val: any, provider: ethers.providers.Provider) {
  if (typeof val !== 'object') {
    return val;
  }
  if (Object.prototype.hasOwnProperty.call(val, '_isBigNumber') && val._isBigNumber) {
    return BigNumber.from(val);
  }
  if (Object.prototype.hasOwnProperty.call(val, '_isTypedBigNumber') && val._isTypedBigNumber) {
    return TypedBigNumber.fromObject(val);
  }
  if (Object.prototype.hasOwnProperty.call(val, '_isSerializedContract')) {
    if (val._isSerializedContract) {
      return new ethers.Contract(val._address, _getABI(val._abiName), provider);
    }
    // Will delete this key when it returns undefined
    return undefined;
  }
  if (Array.isArray(val)) {
    return val.map((v) => _decodeValue(v, provider));
  }

  // This is an object, recurse through it to decode nested properties
  const newVal = val;
  Object.keys(newVal).forEach((key) => {
    const decoded = _decodeValue(newVal[key], provider);
    if (key === 'underlyingContract' && decoded === undefined) {
      delete newVal[key];
    } else {
      newVal[key] = decoded;
    }
  });
  return newVal;
}

function _encodeMap(decoded: any) {
  // Coverts records to maps so that we can use .get on them and get type checking
  const mapped = decoded;
  mapped.USDExchangeRates = new Map(Object.entries(decoded.USDExchangeRates || {}));
  mapped.currencies = new Map(Object.entries(decoded.currencies).map(([k, v]) => [Number(k), v]));
  mapped.ethRateData = new Map(Object.entries(decoded.ethRateData).map(([k, v]) => [Number(k), v]));
  mapped.assetRateData = new Map(Object.entries(decoded.assetRateData).map(([k, v]) => [Number(k), v]));
  mapped.nTokenData = new Map(Object.entries(decoded.nTokenData).map(([k, v]) => [Number(k), v]));
  mapped.cashGroups = new Map(Object.entries(decoded.cashGroups).map(([k, v]) => [Number(k), v]));
  mapped.vaults = new Map(Object.entries(decoded.vaults || {}));
  mapped.tradingEstimates = new Map(Object.entries(decoded.tradingEstimates || {}));
  return mapped;
}

export function decodeJSON(json: any, provider: ethers.providers.Provider): SystemData {
  return _encodeMap(_decodeValue(json, provider));
}

export function decodeBinary(binary: Uint8Array, provider: ethers.providers.Provider): SystemData {
  return decodeJSON(decodeSystemData(binary), provider);
}

export async function fetchAndDecodeSystem(
  cacheUrl: string,
  provider: ethers.providers.Provider,
  skipFetchSetup: boolean
) {
  const _fetch = skipFetchSetup ? fetch : crossFetch;
  const resp = await _fetch(`${cacheUrl}/cache?encoding=binary`);
  if (!resp.ok) throw Error('Could not fetch system');

  const value = new Uint8Array(await resp.arrayBuffer());
  if (value) return decodeBinary(value, provider);

  throw Error('Could not fetch system');
}
