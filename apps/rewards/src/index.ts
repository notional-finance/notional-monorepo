import { TreasuryManager__factory, ERC20__factory, NotionalV3ABI } from '@notional-finance/contracts';
import { DEX_ID, Network, TRADE_TYPE, getProviderFromNetwork, } from '@notional-finance/util';
import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import { vaults, minTokenAmount, ARB_ETH, ARB_WETH } from './vaults';
import { get0xData, sendTxThroughRelayer } from "@notional-finance/util";
import { simulatePopulatedTxn } from "@notional-finance/transaction";

export interface Env {
  NETWORK: keyof typeof Network;
  TREASURY_MANAGER_ADDRESS: string;
  MANAGER_BOT_ADDRESS: string;
  TX_RELAY_AUTH_TOKEN: string;
  ZERO_EX_API_KEY: string;
  AUTH_KEY: string;
  REINVEST_TIME_WINDOW_IN_HOURS: string;
  REWARDS_KV: KVNamespace;
}
const HOUR_IN_SECONDS = 60 * 60;
const SLIPPAGE_PERCENT = 2;

const NotionalV3Interface = new ethers.utils.Interface(NotionalV3ABI);

async function isClaimRewardsProfitable(env: Env, vault: typeof vaults[0], tx: PopulatedTransaction) {
  const { rawLogs } = await simulatePopulatedTxn(Network[env.NETWORK], tx);
  let isProfitable = false;
  for (const log of rawLogs) {
    try {
      const { name, args } = NotionalV3Interface.parseLog(log);
      const rewardToken = vault.rewardTokens.find(
        // log.address is not checksummed
        t => t.toLowerCase() === log.address.toLowerCase()
      );
      if (
        rewardToken &&
        name === 'Transfer' &&
        args.to == vault.address &&
        args.amount.gt(minTokenAmount[rewardToken])
      ) {
        isProfitable = true;
        break;
      }
    } catch {
      console.debug(`Skipping unknown event`)
    }
  }
  return isProfitable;
}


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
          }
      }`
    })
  }).then(r => r.json())
    .then((r: ReinvestmentData) => r.data.reinvestments[0]);
}

async function didTimeWindowPassed(vaultAddress: string, timeWindow: number) {
  const lastReinvestment = await getLastReinvestment(vaultAddress);
  if (lastReinvestment) {
    const currentTimeInSeconds = Date.now() / 1000;

    if (currentTimeInSeconds < (lastReinvestment.timestamp + timeWindow)) {
      return false;
    }
  }

  // case when vault is new and there is no previous reinvestment event
  return true;
}

async function shouldSkipReinvest(env: Env, vaultAddress: string) {
  // subtract 5min from time window so reinvestment can happen each day on same time
  const reinvestTimeWindow = Number(env.REINVEST_TIME_WINDOW_IN_HOURS || 24) * HOUR_IN_SECONDS - 5 * 60;
  return !(await didTimeWindowPassed(vaultAddress, reinvestTimeWindow));
}

async function setLastClaimTimestamp(env: Env, vaultAddress: string) {
  const claimTimestampKey = `${vaultAddress}:claimTimestamp`;

  return env.REWARDS_KV.put(claimTimestampKey, String(Date.now() / 1000));
}

async function shouldSkipClaim(env: Env, vaultAddress: string) {
  const claimTimestampKey = `${vaultAddress}:claimTimestamp`;
  const lastClaimTimestamp = Number(await env.REWARDS_KV.get(claimTimestampKey));

  // subtract 5min from time window so reinvestment can happen each day on same time
  const reinvestTimeWindow = Number(env.REINVEST_TIME_WINDOW_IN_HOURS || 24) * HOUR_IN_SECONDS - 5 * 60;
  return Date.now() / 1000 < Number(lastClaimTimestamp) + reinvestTimeWindow;
}

const claimRewards = async (env: Env, provider: any) => {
  const treasuryManger = TreasuryManager__factory.connect(
    env.TREASURY_MANAGER_ADDRESS,
    provider
  );

  const results = await Promise.allSettled(
    vaults.map(async (vault) => {
      if (await shouldSkipClaim(env, vault.address)) {
        console.log(`Skipping claim rewards for ${vault.address}, already claimed`);
        return null;
      }

      // make sure call will be successful
      await treasuryManger.callStatic.claimVaultRewardTokens(
        vault.address,
        { from: env.MANAGER_BOT_ADDRESS }
      );

      const data = treasuryManger.interface.encodeFunctionData(
        'claimVaultRewardTokens',
        [vault.address]
      );

      const tx: PopulatedTransaction = {
        from: env.MANAGER_BOT_ADDRESS,
        to: env.TREASURY_MANAGER_ADDRESS,
        data
      }
      if (!(await isClaimRewardsProfitable(env, vault, tx))) {
        console.log(`Skipping claim rewards for ${vault.address}, not profitable`);
        return null;
      }

      console.log(`Sending claim tx for ${vault.address}`);

      await sendTxThroughRelayer({
        to: env.TREASURY_MANAGER_ADDRESS,
        data,
        env,
      });

      await setLastClaimTimestamp(env, vault.address);
    })
  );

  const failedClaims = results.filter(r => r.status == 'rejected') as PromiseRejectedResult[];
  // if any of the claims failed throw error so worker execution can be properly
  // marked as failed and alarms can be triggered
  if (failedClaims.length) {
    throw new Error(failedClaims[0].reason);
  }
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
  let slippageMultiplier = 1;
  // we need to execute them sequentially due to rate limit on 0x api
  return executePromisesSequentially(tokens.map((token, i) => async () => {
    const amount = sellAmounts[i];
    let oracleSlippagePercentOrLimit = '0';
    let exchangeData = '0x00';

    if (!amount.eq(0)) {
      const tradeData = await get0xData({
        sellToken,
        buyToken: token == ARB_ETH ? ARB_WETH : token,
        sellAmount: amount,
        slippagePercentage: SLIPPAGE_PERCENT * (slippageMultiplier++),
        env,
      });

      oracleSlippagePercentOrLimit = tradeData.limit.toString();
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

const reinvestVault = async (env: Env, provider: any, vault: typeof vaults[0]) => {
  if (await shouldSkipReinvest(env, vault.address)) {
    console.log(`Skipping reinvestment for ${vault.address}, already invested`);
    return null;
  }

  const tradesPerRewardToken = [];
  for (const sellToken of vault.rewardTokens) {
    const amount = await ERC20__factory.connect(sellToken, provider).balanceOf(vault.address);
    if (amount.lt(BigNumber.from(minTokenAmount[sellToken]))) {
      console.log(`Skipping reinvestment for ${vault.address}: ${sellToken}, ${amount} is less than minimum`);
      continue;
    }
    const sellAmountsPerToken = vault.tokenWeights.map((weight: number) => {
      return amount.mul(weight).div(100);
    });

    const trades = await getTrades(
      env,
      sellToken,
      vault.poolTokens,
      sellAmountsPerToken,
    );
    tradesPerRewardToken.push(trades);
  }
  if (tradesPerRewardToken.length == 0) {
    console.log(`Found no reward tokens on vault ${vault.address}, skipping.`);
    return null;
  }

  const treasuryManger = TreasuryManager__factory.connect(
    env.TREASURY_MANAGER_ADDRESS,
    provider
  );

  const { poolClaimAmounts } = await treasuryManger.callStatic.reinvestVaultReward(
    vault.address,
    tradesPerRewardToken,
    tradesPerRewardToken.map(() => BigNumber.from(0)),
    {
      from: env.MANAGER_BOT_ADDRESS,
      gasLimit: 60e6
    }
  );

  await treasuryManger.callStatic.reinvestVaultReward(
    vault.address,
    tradesPerRewardToken,
    poolClaimAmounts.map((amount) => amount.mul(99).div(100)), // minPoolClaims, 1% discounted poolClaimAmounts
    {
      from: env.MANAGER_BOT_ADDRESS,
      gasLimit: 60e6
    }
  );


  const data = treasuryManger.interface.encodeFunctionData('reinvestVaultReward', [
    vault.address,
    tradesPerRewardToken,
    poolClaimAmounts.map((amount) => amount.mul(99).div(100)), // minPoolClaims, 1% discounted poolClaimAmounts
  ]);

  console.log(`sending reinvestment tx to relayer from vault: ${vault.address}`);

  return sendTxThroughRelayer({
    to: treasuryManger.address,
    data,
    env,
  })
};

const reinvestRewards = async (env: Env, provider: any) => {
  const errors: any = [];
  for (const vault of vaults) {
    try {
      await reinvestVault(env, provider, vault);
    } catch (err) {
      console.error(`Reinvestment for vault: ${vault.address} failed`);
      console.error(err);
      errors.push(err);
    }
  }
  // if any of the reinvestments failed throw error so worker execution can be properly
  // marked as failed and alarms can be triggered
  if (errors.length) {
    throw errors[0];
  }
};

export default {
  async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (authKey !== env.AUTH_KEY) {
      console.log("Headers: ", new Map(request.headers));
      console.log("Cf: ", request.cf);
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

    // cron job will run twice, once on full hour and second time 10 minutes later
    // first time it will claim rewards and second time reinvest it
    const currentMinuteInHour = (new Date()).getMinutes();
    if (currentMinuteInHour < 10) {
      await claimRewards(env, provider);
    } else {
      await reinvestRewards(env, provider);
    }
  },
};
