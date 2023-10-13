import {
  TreasuryManager__factory,
  ERC20__factory,
  Curve2TokenConvexVault,
} from '@notional-finance/contracts';
import {
  DEX_ID,
  Network,
  TRADE_TYPE,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber, ethers } from 'ethers';
import { vaults } from './vaults';

export interface Env {
  NETWORK: string;
  TREASURY_MANAGER_ADDRESS: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
  ZERO_EX_PRICE_URL: string;
  ZERO_EX_API_KEY: string;
}

const TRADE_PARAMS = 'tuple(uint16,uint8,uint256,bool,bytes)';
const SINGLE_SIDED_TRADE_PARAMS = `tuple(address,address,uint256,${TRADE_PARAMS})`;
const VAULT_TRADE_PARAMS = `tuple(${SINGLE_SIDED_TRADE_PARAMS},${SINGLE_SIDED_TRADE_PARAMS})`;
const ONE = BigNumber.from('1000000000000000000');

const claimRewards = async (env: Env, provider: any) => {
  return Promise.all(
    vaults.map((v) => {
      const encoded = TreasuryManager__factory.connect(
        env.TREASURY_MANAGER_ADDRESS,
        provider
      ).interface.encodeFunctionData('claimVaultRewardTokens', [v.address]);

      const payload = JSON.stringify({
        to: env.TREASURY_MANAGER_ADDRESS,
        data: encoded,
      });

      return fetch(env.TX_RELAY_URL + '/v1/txes/0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
        },
        body: payload,
      });
    })
  );
};

const getZeroExTradeData = async (
  env: Env,
  sellToken: string,
  buyToken: string,
  amount: BigNumber
) => {
  const params = `?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${amount.toString()}&slippagePercentage=0.05`;
  const resp = await fetch(env.ZERO_EX_PRICE_URL + params, {
    headers: {
      '0x-api-key': env.ZERO_EX_API_KEY,
    },
  });

  // Delay to prevent rate limiting
  await new Promise((f) => setTimeout(f, 2000));

  return resp.json();
};

const reinvestToken = async (
  env: Env,
  provider: any,
  vaultAddress: string,
  pool: any,
  sellToken: string,
  amount: BigNumber
) => {
  const primaryToken = pool.primaryToken;
  const secondaryToken = pool.secondaryToken;
  const primaryBalance = pool.primaryBalance
    .mul(ONE)
    .div(BigNumber.from(10).pow(pool.primaryDecimals));
  const secondaryBalance = pool.secondaryBalance
    .mul(ONE)
    .div(BigNumber.from(10).pow(pool.secondaryDecimals));
  const primaryRatio = primaryBalance
    .mul(ONE)
    .div(primaryBalance.add(secondaryBalance));
  const primaryAmount = amount.mul(primaryRatio).div(ONE);
  const secondaryAmount = amount.sub(primaryAmount);

  const primaryTradeData = await getZeroExTradeData(
    env,
    sellToken,
    primaryToken,
    primaryAmount
  );
  const secondaryTradeData = await getZeroExTradeData(
    env,
    sellToken,
    secondaryToken,
    secondaryAmount
  );

  const coder = new ethers.utils.AbiCoder();
  const primaryTrade = [
    sellToken,
    primaryToken,
    primaryAmount,
    [
      DEX_ID.ZERO_EX,
      TRADE_TYPE.EXACT_IN_SINGLE,
      BigNumber.from(primaryTradeData['buyAmount']).mul(95).div(100),
      false,
      primaryTradeData['data'],
    ],
  ];

  const secondaryTrade = [
    sellToken,
    secondaryToken,
    secondaryAmount,
    [
      DEX_ID.ZERO_EX,
      TRADE_TYPE.EXACT_IN_SINGLE,
      BigNumber.from(secondaryTradeData['buyAmount']).mul(95).div(100),
      false,
      secondaryTradeData['data'],
    ],
  ];

  const tradeData = coder.encode(
    [VAULT_TRADE_PARAMS],
    [[primaryTrade, secondaryTrade]]
  );

  const encoded = TreasuryManager__factory.connect(
    env.TREASURY_MANAGER_ADDRESS,
    provider
  ).interface.encodeFunctionData('reinvestVaultReward', [
    vaultAddress,
    {
      tradeData: tradeData,
      minPoolClaim: BigNumber.from(0),
    },
  ]);

  const payload = JSON.stringify({
    to: env.TREASURY_MANAGER_ADDRESS,
    data: encoded,
  });

  return fetch(env.TX_RELAY_URL + '/v1/txes/0', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  });
};

const reinvestVault = async (env: Env, provider: any, vault: any) => {
  const instance = vault.factory.connect(
    vault.address,
    provider
  ) as Curve2TokenConvexVault;

  const context = await instance.getStrategyContext();
  const rewardTokens = context.stakingContext.rewardTokens;

  const balances = await Promise.all(
    rewardTokens.map((t) =>
      ERC20__factory.connect(t, provider).balanceOf(vault.address)
    )
  );

  await Promise.all(
    rewardTokens.map((t, i) => {
      const amount = balances[i];

      if (amount.isZero()) return null;

      return reinvestToken(
        env,
        provider,
        vault.address,
        context.poolContext.basePool,
        t,
        amount
      );
    })
  );
};

const reinvestRewards = async (env: Env, provider: any) => {
  return Promise.all(vaults.map((v) => reinvestVault(env, provider, v)));
};

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    const provider = getProviderFromNetwork(Network[env.NETWORK], true);

    await claimRewards(env, provider);
    await reinvestRewards(env, provider);
    return new Response('OK');
  },
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    const provider = getProviderFromNetwork(Network[env.NETWORK], true);

    await claimRewards(env, provider);
    await reinvestRewards(env, provider);
  },
};
