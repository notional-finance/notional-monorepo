import { TreasuryManager__factory, ERC20__factory } from '@notional-finance/contracts';
import { DEX_ID, Network, TRADE_TYPE, getProviderFromNetwork, } from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { vaults } from './vaults';

export interface Env {
  NETWORK: string;
  TREASURY_MANAGER_ADDRESS: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
  ZERO_EX_PRICE_URL: string;
  ZERO_EX_API_KEY: string;
  AUTH_KEY: string;
  REINVEST_TIME_WINDOW_IN_HOURS: string;

}
const HOUR_IN_SECONDS = 60 * 60;
const SLIPPAGE_PERCENT = 1;
const wait = (ms: number) => new Promise((f) => setTimeout(f, ms));

interface ReinvestmentData {
  data: {
    reinvestments: [{
      timestamp: number;
    }]
  }
}
async function getLastReinvestment(vault: string): Promise<{ timestamp: number } | null> {
  return fetch('https://api.studio.thegraph.com/query/36749/notional-v3-arbitrum/version/latest', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      query: `{
          reinvestments(
            orderBy: timestamp,
            orderDirection:desc,
            first:1,
            where:{vault: "${vault.toLowerCase()}" }
          ) {
            timestamp
            rewardTokenSold
          }
      }`
    })
  }).then(r => r.json())
    .then((r: ReinvestmentData) => r.data.reinvestments[0]);
}

async function shouldSkipReinvest(env: Env, vaultAddress: string) {
  const lastReinvestment = await getLastReinvestment(vaultAddress);

  if (lastReinvestment) {
    const reinvestTimeWindow =
      Number(env.REINVEST_TIME_WINDOW_IN_HOURS || 24) * HOUR_IN_SECONDS;
    const currentTimeInSeconds = Date.now() / 1000;

    // allow reinvestment to happen only once in reinvest time window
    if (currentTimeInSeconds < (lastReinvestment.timestamp + reinvestTimeWindow)) {
      return true;
    }
  }

  return false;
}

const claimRewards = async (env: Env, provider: any) => {
  return Promise.all(
    vaults.map(async (v) => {
      if (await shouldSkipReinvest(env, v.address)) {
        console.log(`Skipping claim rewards for ${v.address}, already claimed`);
        return null;
      }

      const encoded = TreasuryManager__factory.connect(
        env.TREASURY_MANAGER_ADDRESS,
        provider
      ).interface.encodeFunctionData('claimVaultRewardTokens', [v.address]);

      const payload = JSON.stringify({
        to: env.TREASURY_MANAGER_ADDRESS,
        data: encoded,
      });
      // cspell:disable-next-line
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

interface ZeroXData {
  buyAmount: string;
  data: string;
}
const getZeroExTradeData = async (
  env: Env,
  sellToken: string,
  buyToken: string,
  amount: BigNumber
): Promise<ZeroXData> => {
  const params = `?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${amount.toString()}&slippagePercentage=0.05`;
  console.log("params", params);
  const resp = await fetch(env.ZERO_EX_PRICE_URL + params, {
    headers: {
      '0x-api-key': env.ZERO_EX_API_KEY,
    },
  });

  // Delay to prevent rate limiting
  await wait(2000);

  return resp.json();
};

type FunRetProm = () => Promise<any>;
const executePromisesSequentially = async (funcArray: FunRetProm[]): Promise<any[]> => {
  return funcArray.reduce(async (accumulator, func) => {
    const results = await accumulator;
    return [...results, await func()];
  }, Promise.resolve([]));
};

const getTrades = async (
  env: Env,
  sellToken: string,
  tokens: string[],
  sellAmounts: BigNumber[]
) => {
  // we need to execute them sequentially due to rate limit on 0x api
  return executePromisesSequentially(tokens.map((token, i) => async () => {
    const amount = sellAmounts[i];
    let oracleSlippagePercentOrLimit = '0';
    let exchangeData = '0x00';

    if (!amount.eq(0)) {
      let retryCount = 0;
      let tradeData: any;
      do {
        tradeData = await getZeroExTradeData(env,
          sellToken,
          token,
          amount
        );
        if (tradeData.buyAmount == undefined) {
          console.log('Request to 0x failed: ', retryCount);
        }
        // 0x API sometimes returns  insufficient  liquidity error
        // so we retry here
      } while (tradeData.buyAmount == undefined && retryCount++ < 5);

      oracleSlippagePercentOrLimit =
        BigNumber.from(tradeData.buyAmount).mul(100 - SLIPPAGE_PERCENT).div(100).toString();
      exchangeData = tradeData.data;
    }

    return [
      sellToken,
      token,
      amount.toString(),
      [
        DEX_ID.ZERO_EX,
        TRADE_TYPE.EXACT_IN_SINGLE,
        oracleSlippagePercentOrLimit,
        exchangeData,
      ],
    ];
  }));
}

const reinvestToken = async (
  env: Env,
  provider: any,
  vault: typeof vaults[0],
  sellToken: string,
  amount: BigNumber
) => {
  const sellAmountsPerToken = vault.tokenWeights.map((weight: number) => {
    return amount.mul(weight).div(100);
  });

  const trades = await getTrades(
    env,
    sellToken,
    vault.poolTokens,
    sellAmountsPerToken,
  );

  const data = TreasuryManager__factory.connect(
    env.TREASURY_MANAGER_ADDRESS,
    provider
  ).interface.encodeFunctionData('reinvestVaultReward', [
    vault.address,
    trades,
    BigNumber.from(0), // minPoolClaim
  ]);

  const payload = JSON.stringify({
    to: env.TREASURY_MANAGER_ADDRESS,
    data,
  });

  // cspell:disable-next-line
  return fetch(env.TX_RELAY_URL + '/v1/txes/0', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  });
};

const reinvestVault = async (env: Env, provider: any, vault: typeof vaults[0]) => {
  await executePromisesSequentially(vault.rewardTokens.map((t) => async () => {
    const amount = await ERC20__factory.connect(t, provider).balanceOf(vault.address);

    if (amount.isZero()) return null;

    if (await shouldSkipReinvest(env, vault.address)) {
      console.log(`Skipping reinvestment for ${vault.address}, already invested`);
      return null;
    }

    return reinvestToken(
      env,
      provider,
      vault,
      t,
      amount
    );
  })
  );
}

const reinvestRewards = async (env: Env, provider: any) => {
  return executePromisesSequentially(vaults.map((v) => () => reinvestVault(env, provider, v)));
};

export default {
  async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (authKey !== env.AUTH_KEY) {
      return new Response(null, { status: 401 });
    }

    const provider = getProviderFromNetwork(Network[env.NETWORK], true);

    await claimRewards(env, provider);
    await reinvestRewards(env, provider);

    return new Response('OK');
  },
  // this method can be only call by cloudflare internal system so it does not
  // require any authentication
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    const provider = getProviderFromNetwork(Network[env.NETWORK], true);

    await claimRewards(env, provider);
    await reinvestRewards(env, provider);
  },
};
