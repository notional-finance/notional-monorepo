import { BigNumber, Contract } from 'ethers';
import { Network, VaultData, Provider, RewardPoolType } from './types';
import {
  CurvePoolInterface,
  ERC20Interface,
  BalancerPoolInterface,
  BalancerSpotPriceInterface,
  BalancerVaultInterface,
  CurvePoolAltInterface,
} from './interfaces';
import { Oracle } from './oracles';
import { POOL_DECIMALS } from './config';
import { getTokenDecimals, e, toInt18Precision } from './util';

const SUBGRAPH_API_KEY = process.env.SUBGRAPH_API_KEY as string;
const log = require('debug')('vault-apy');

export enum ProtocolName {
  NotionalV3 = 'NotionalV3',
  BalancerV2 = 'BalancerV2',
  Curve = 'Curve',
}

const balancerSpotPriceAddress: Record<Network, string> = {
  [Network.mainnet]: '0xA153B3E85833F8a323E60Dcdc08F6286eae28728',
  [Network.arbitrum]: '0x904d881ceC1b8bc3f3Ff32cCf9533c1843706E9e',
};

const balancerVaultAddress: Record<Network, string> = {
  [Network.mainnet]: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  [Network.arbitrum]: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
};

export const defaultGraphEndpoints: Record<string, Record<string, string>> = {
  [ProtocolName.BalancerV2]: {
    [Network.mainnet]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV`,
    [Network.arbitrum]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/98cQDy6tufTJtshDCuhh9z2kWXsQWBHVh2bqnLHsGAeS`,
  },
  [ProtocolName.Curve]: {
    [Network.mainnet]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/3fy93eAT56UJsRCEht8iFhfi6wjHWXtZ9dnnbQmvFopF`,
    [Network.arbitrum]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/Gv6NJRut2zrm79ef4QHyKAm41YHqaLF392sM3cz9wywc`,
  },
};

const balancerV2SwapFeeQuery = (poolAddress: string, blockNumber: number) => `
    query BalancerV2SwapFee($poolId: String, $ts: Int) {
        poolSnapshots(
          first: 2
          orderBy: timestamp
          orderDirection: desc
          where: {pool_: {id: "${poolAddress}"}}
          block: { number: ${blockNumber} }
        ) {
          swapFees
        }
      }
    `;

const curveSwapFeeQuery = (poolAddress: string, blockNumber: number) => `
    query {
        liquidityPoolDailySnapshots(
          first: 1
          orderBy: timestamp
          orderDirection: desc
          where: {pool_: {id: "${poolAddress.toLowerCase()}"}}
          block: { number: ${blockNumber} }
        ) {
          dailySupplySideRevenueUSD
        }
    }
    `;

const processCurve = async (
  network: Network,
  oracle: Oracle,
  vaultData: VaultData,
  blockNumber: number,
  provider: Provider
) => {
  let feesInUSD: BigNumber = BigNumber.from(0);
  try {
    const {
      data: { liquidityPoolDailySnapshots },
    }: any = await fetch(defaultGraphEndpoints[ProtocolName.Curve][network], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({
        query: curveSwapFeeQuery(vaultData.pool, blockNumber),
      }),
    }).then((r) => r.json());
    // price from graph is returned as decimal number, upscale to 18 decimals precision
    feesInUSD = toInt18Precision(
      liquidityPoolDailySnapshots[0].dailySupplySideRevenueUSD
    );
  } catch {
    // Error: sometimes subgraph cannot be accessed
  }

  let curvePool = new Contract(vaultData.pool, CurvePoolInterface, provider);
  const totalSupply = await curvePool.totalSupply();
  let tokensBalances: BigNumber[];
  try {
    tokensBalances = await curvePool.get_balances();
  } catch {
    curvePool = new Contract(vaultData.pool, CurvePoolAltInterface, provider);
    tokensBalances = await curvePool.get_balances();
  }

  const primaryPrice = await oracle.defiLlamaGetPrice(
    vaultData.primaryBorrowCurrency
  );
  const feesInPrimary = feesInUSD
    .mul(e(primaryPrice.decimals))
    .div(primaryPrice.price);

  const feesPerShareInPrimary = feesInPrimary
    .mul(e(POOL_DECIMALS))
    .div(totalSupply);

  // in 18 decimals precision
  let totalPoolValueInUSD = BigNumber.from(0);
  for (let i = 0; i < tokensBalances.length; i++) {
    const token = await curvePool.coins(i);
    const tokenPrice =
      token === vaultData.primaryBorrowCurrency
        ? primaryPrice
        : await oracle.defiLlamaGetPrice(token);
    const tokenDecimals = await new Contract(
      token,
      ERC20Interface,
      provider
    ).decimals();

    totalPoolValueInUSD = totalPoolValueInUSD.add(
      tokensBalances[i]
        .mul(tokenPrice.price)
        .mul(e(18))
        .div(e(tokenPrice.decimals))
        .div(e(tokenDecimals))
    );
  }
  const totalPoolValueInPrimary = totalPoolValueInUSD
    .mul(e(primaryPrice.decimals))
    .div(primaryPrice.price);

  const poolValuePerShareInPrimary = totalPoolValueInPrimary
    .mul(e(POOL_DECIMALS))
    .div(totalSupply);

  return {
    feesPerShareInPrimary,
    poolValuePerShareInPrimary,
    decimals: 18,
  };
};

const processBalancer = async (
  network: Network,
  oracle: Oracle,
  vaultData: VaultData,
  blockNumber: number,
  provider: Provider
) => {
  if (
    vaultData.rewardPoolType !== RewardPoolType.Aura &&
    vaultData.rewardPoolType !== RewardPoolType.Balancer
  ) {
    throw new Error('Wrong vault type');
  }

  const balancerPool = new Contract(
    vaultData.pool,
    BalancerPoolInterface,
    provider
  );
  const balancerSpotPrice = new Contract(
    balancerSpotPriceAddress[network],
    BalancerSpotPriceInterface,
    provider
  );
  const balancerVault = new Contract(
    balancerVaultAddress[network],
    BalancerVaultInterface,
    provider
  );

  const poolId = await balancerPool.getPoolId();
  const { tokens: poolTokens }: { tokens: string[] } =
    await balancerVault.getPoolTokens(poolId);
  const primaryBorrowIndex = poolTokens.findIndex(
    (e) => e === vaultData.primaryBorrowCurrency
  );
  const bptIndex = Number(
    await balancerPool.getBptIndex().then((r: BigNumber) => r.toString())
  );
  const tokensDecimals = await Promise.all(
    poolTokens.map((t) => getTokenDecimals(t, provider))
  );

  // prices precision is in pool decimals
  const { balances, spotPrices } =
    await balancerSpotPrice.getComposableSpotPrices(
      poolId,
      vaultData.pool,
      primaryBorrowIndex,
      bptIndex,
      tokensDecimals
    );

  let feesInUSD = BigNumber.from(0);
  try {
    const {
      data: { poolSnapshots },
    }: any = await fetch(
      defaultGraphEndpoints[ProtocolName.BalancerV2][network],
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: balancerV2SwapFeeQuery(poolId, blockNumber),
        }),
      }
    ).then((r) => r.json());
    // price from graph is returned as decimal number, upscale to 1e18 precision
    feesInUSD = toInt18Precision(
      Number(poolSnapshots[0].swapFees) - Number(poolSnapshots[1].swapFees)
    );
  } catch (e) {
    log(e);
  }

  const totalSupply = await balancerPool.getActualSupply();

  const primaryPrice = await oracle.defiLlamaGetPrice(
    vaultData.primaryBorrowCurrency
  );

  const feesInPrimary = feesInUSD
    .mul(e(primaryPrice.decimals))
    .div(primaryPrice.price);

  const feesPerShareInPrimary = feesInPrimary
    .mul(e(POOL_DECIMALS))
    .div(totalSupply);

  let totalPoolValueInPrimary = BigNumber.from(0);
  for (let i = 0; i < poolTokens.length; i++) {
    if (i === bptIndex) continue;
    const tokenDecimals = await getTokenDecimals(poolTokens[i], provider);
    if (poolTokens[i] === vaultData.primaryBorrowCurrency) {
      totalPoolValueInPrimary = totalPoolValueInPrimary.add(
        balances[i].mul(e(POOL_DECIMALS).div(e(tokenDecimals)))
      );
    } else {
      const reversePrice = e(36).div(spotPrices[i]);
      totalPoolValueInPrimary = totalPoolValueInPrimary.add(
        BigNumber.from(balances[i]).mul(reversePrice).div(e(tokenDecimals))
      );
    }
  }

  const poolValuePerShareInPrimary = totalPoolValueInPrimary
    .mul(e(POOL_DECIMALS))
    .div(totalSupply);

  return {
    feesPerShareInPrimary,
    poolValuePerShareInPrimary,
    decimals: 18,
  };
};

export async function getPoolFees(
  network: Network,
  oracle: Oracle,
  vaultData: VaultData,
  blockNumber: number,
  provider: Provider
) {
  if (
    [RewardPoolType.Aura, RewardPoolType.Balancer].includes(
      vaultData.rewardPoolType
    )
  ) {
    return processBalancer(network, oracle, vaultData, blockNumber, provider);
  } else {
    return processCurve(network, oracle, vaultData, blockNumber, provider);
  }
}
