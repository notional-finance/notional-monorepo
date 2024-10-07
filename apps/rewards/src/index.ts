import {
  TreasuryManager__factory,
  ERC20__factory,
  NotionalV3ABI,
  ISingleSidedLPStrategyVault__factory,
} from '@notional-finance/contracts';
import {
  DEX_ID,
  Network,
  TRADE_TYPE,
  TokenAddress,
  VaultAddress,
  tokens as tokenAddresses,
  getProviderFromNetwork,
  getSubgraphEndpoint,
} from '@notional-finance/util';
import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import { getVaultsForReinvestment, minTokenAmount, Vault } from './vaults';
import {
  get0xData,
  sendTxThroughRelayer,
  managerBotAddresses,
  treasuryManagerAddresses,
} from '@notional-finance/util';
import { simulatePopulatedTxn } from '@notional-finance/transaction';
import { Logger, MetricType } from '@notional-finance/util';
import { Env } from './types';
import { checkTradeLoss } from '@notional-finance/util';
import { SingleSidedRewardTradeParamsStruct } from '@notional-finance/contracts/types/ISingleSidedLPStrategyVault';

type Provider = ethers.providers.Provider;
const HOUR_IN_SECONDS = 60 * 60;
const SLIPPAGE_PERCENT = 2;

const NotionalV3Interface = new ethers.utils.Interface(NotionalV3ABI);

const reinvestTimeWindowInHours: Partial<Record<Network, number>> = {
  mainnet: 7 * 24,
  arbitrum: 24,
};

interface ReinvestmentData {
  data: {
    reinvestments: [
      {
        timestamp: number;
      }
    ];
  };
}
async function getLastReinvestment(
  env: Env,
  vault: string
): Promise<{ timestamp: number } | null> {
  return fetch(getSubgraphEndpoint(env.NETWORK, env.SUBGRAPH_API_KEY), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
      }`,
    }),
  })
    .then((r) => r.json())
    .then((r) => (r as ReinvestmentData).data.reinvestments[0]);
}

const max = (a: number, b: number) => (a < b ? b : a);

async function setLastTransaction(
  env: Env,
  vaultAddress: string,
  txResponse: ethers.providers.TransactionResponse
) {
  await env.LOGGER.submitMetrics({
    series: [
      {
        metric: `monitoring.rewards.last_reinvestment_timestamp`,
        points: [
          {
            value: 1,
            timestamp: txResponse.timestamp || 0,
          },
        ],
        tags: [`network:${env.NETWORK}`, `vault:${vaultAddress}`],
        type: MetricType.Count,
      },
    ],
  });

  return env.REWARDS_KV.put(
    `${vaultAddress}:reinvestmentTxHash`,
    txResponse.hash
  );
}

async function getLastTransactionTimestamp(
  env: Env,
  vaultAddress: string,
  key: 'reinvestment' | 'claim',
  provider: Provider
) {
  const txHashKey = `${vaultAddress}:${key}TxHash`;
  const txHash = await env.REWARDS_KV.get(txHashKey);
  if (!txHash) {
    return 0;
  }
  const receipt = await provider.getTransactionReceipt(txHash);
  if (receipt?.status !== 1) {
    return 0;
  }
  const block = await provider.getBlock(receipt.blockNumber);
  return block.timestamp;
}

async function shouldSkipReinvest(
  env: Env,
  vaultAddress: string,
  provider: Provider
) {
  // subtract 5min from time window so reinvestment can happen at the same time in a day
  const reinvestTimeWindow =
    Number(reinvestTimeWindowInHours[env.NETWORK] || 24) * HOUR_IN_SECONDS -
    5 * 60;

  const lastReinvestTimestampFromKV = await getLastTransactionTimestamp(
    env,
    vaultAddress,
    'reinvestment',
    provider
  );

  const lastReinvestmentTimestampSubgraph = await getLastReinvestment(
    env,
    vaultAddress
  ).then((r) => (r ? Number(r.timestamp) : 0));

  // take larger timestamp so in case graph is out of sync we would not reinvest each time but is run
  const lastReinvestmentTimestamp = max(
    lastReinvestTimestampFromKV,
    lastReinvestmentTimestampSubgraph
  );

  if (lastReinvestmentTimestamp) {
    const currentTimeInSeconds = Date.now() / 1000;

    if (currentTimeInSeconds < lastReinvestmentTimestamp + reinvestTimeWindow) {
      return true;
    }
  }
  return false;
}

const simulateClaimVault = async (
  env: Env,
  provider: Provider,
  vault: Vault<TokenAddress, VaultAddress>
) => {
  const treasuryManger = TreasuryManager__factory.connect(
    treasuryManagerAddresses[env.NETWORK],
    provider
  );

  const from = managerBotAddresses[env.NETWORK];
  const to = treasuryManagerAddresses[env.NETWORK];
  // make sure call will be successful
  await treasuryManger.callStatic.claimVaultRewardTokens(vault.address, {
    from,
  });

  const data = treasuryManger.interface.encodeFunctionData(
    'claimVaultRewardTokens',
    [vault.address]
  );

  const tx: PopulatedTransaction = { from, to, data };
  const { rawLogs } = await simulatePopulatedTxn(env.NETWORK, tx);

  const tokensClaimedMap = new Map<TokenAddress, BigNumber>();
  vault.rewardTokens.forEach((token) => {
    tokensClaimedMap.set(token, BigNumber.from(0));
  });

  for (const log of rawLogs) {
    try {
      const { name, args } = NotionalV3Interface.parseLog(log);
      const rewardToken = vault.rewardTokens.find(
        // log.address is not checksummed
        (t) => t.toLowerCase() === log.address.toLowerCase()
      );
      if (
        rewardToken &&
        name === 'Transfer' &&
        args.to == vault.address &&
        args.amount.gt(minTokenAmount[rewardToken])
      ) {
        const prevAmount = tokensClaimedMap.get(rewardToken);
        tokensClaimedMap.set(rewardToken, prevAmount.add(args.amount));
      }
    } catch {
      console.debug(`Skipping unknown event`);
    }
  }
  return tokensClaimedMap;
};

type FunRetProm<T> = () => Promise<T>;
const executePromisesSequentially = async <T>(funcArray: FunRetProm<T>[]) => {
  return funcArray.reduce(async (accumulator, func) => {
    const results = await accumulator;
    return [...results, await func()];
  }, Promise.resolve([] as T[]));
};

const getTrades = async (
  env: Env,
  sellToken: string,
  tokens: string[],
  sellAmounts: BigNumber[],
  taker: string
) => {
  let slippageMultiplier = 1;
  // we need to execute them sequentially due to rate limit on 0x api
  return executePromisesSequentially(
    tokens.map((token, i) => async () => {
      const amount = sellAmounts[i];
      let oracleSlippagePercentOrLimit = '0';
      let exchangeData = '0x00';

      // only construct a trade if there is an amount to sell and sell token is not the same as buy token
      if (!amount.eq(0) && sellToken.toLowerCase() != token.toLowerCase()) {
        const tradeData = await get0xData({
          sellToken,
          buyToken:
            token == tokenAddresses[env.NETWORK].ETH
              ? tokenAddresses[env.NETWORK].WETH
              : token,
          sellAmount: amount,
          slippagePercentage: SLIPPAGE_PERCENT * slippageMultiplier++,
          taker,
          env,
        });

        oracleSlippagePercentOrLimit = tradeData.limit.toString();
        exchangeData = tradeData.data;

        const { lossPercentage, acceptable } = await checkTradeLoss(
          env.NETWORK,
          {
            sellToken,
            sellAmount: amount,
            buyToken: token,
            buyAmount: tradeData.buyAmount,
          }
        );

        if (!acceptable) {
          throw new Error(
            `Trade from ${sellToken} to ${token} has high loss of: ${lossPercentage}%`
          );
        }
      }

      return {
        sellToken,
        buyToken: token,
        amount: amount.toString(),
        tradeParams: {
          dexId: DEX_ID.ZERO_EX,
          tradeType: TRADE_TYPE.EXACT_IN_SINGLE,
          oracleSlippagePercentOrLimit: oracleSlippagePercentOrLimit,
          exchangeData: exchangeData,
        },
      };
    })
  );
};

const claimAndReinvestVault = async (
  env: Env,
  provider: Provider,
  vault: Vault<TokenAddress, VaultAddress>,
  force = false
) => {
  if (!force && (await shouldSkipReinvest(env, vault.address, provider))) {
    console.log(`Skipping reinvestment for ${vault.address}, already invested`);
    return null;
  }

  const tokenClaimMap = await simulateClaimVault(env, provider, vault);

  const [poolTokens] = await ISingleSidedLPStrategyVault__factory.connect(
    vault.address,
    provider
  ).TOKENS();

  const tradesPerRewardToken: SingleSidedRewardTradeParamsStruct[][] = [];
  for (const sellToken of vault.rewardTokens) {
    let amountToSell = await ERC20__factory.connect(sellToken, provider)
      // get the amount of reward token sitting on the vault
      .balanceOf(vault.address)
      // add the amount of reward token that will be claimed
      .then((amountOnVault) => amountOnVault.add(tokenClaimMap.get(sellToken)));

    if (
      vault.maxSellAmount?.[sellToken] &&
      BigNumber.from(vault.maxSellAmount?.[sellToken]).lt(amountToSell)
    ) {
      amountToSell = BigNumber.from(vault.maxSellAmount?.[sellToken]);
      console.log(`Sell amount limited to ${amountToSell.toString()}`);
    }

    if (amountToSell.lt(BigNumber.from(minTokenAmount[sellToken]))) {
      console.log(
        `Skipping reinvestment for ${vault.address}: ${sellToken}, ${amountToSell} is less than minimum`
      );
      continue;
    }
    // in case sell token is pool token, don't sell it, reinvest it
    const isSellTokenPoolToken = poolTokens.some(
      (address) => address.toLowerCase() === sellToken.toLowerCase()
    );

    const tokenToBuy = isSellTokenPoolToken ? sellToken : vault.reinvestToken;
    const sellAmountsPerToken = poolTokens.map((address) => {
      return address.toLowerCase() === tokenToBuy.toLowerCase()
        ? amountToSell
        : BigNumber.from(0);
    });

    const trades = await getTrades(
      env,
      sellToken,
      poolTokens,
      sellAmountsPerToken,
      vault.address
    );
    tradesPerRewardToken.push(trades);
  }
  if (tradesPerRewardToken.length == 0) {
    console.log(`Found no reward tokens on vault ${vault.address}, skipping.`);
    return null;
  }

  const treasuryManger = TreasuryManager__factory.connect(
    treasuryManagerAddresses[env.NETWORK],
    provider
  );

  const from = managerBotAddresses[env.NETWORK];
  const { poolClaimAmounts } =
    await treasuryManger.callStatic.claimAndReinvestVaultReward(
      vault.address,
      tradesPerRewardToken,
      tradesPerRewardToken.map(() => BigNumber.from(0)),
      {
        from,
        gasLimit: 60e6,
      }
    );

  await treasuryManger.callStatic.claimAndReinvestVaultReward(
    vault.address,
    tradesPerRewardToken,
    poolClaimAmounts.map((amount) => amount.mul(99).div(100)), // minPoolClaims, 1% discounted poolClaimAmounts
    {
      from,
      gasLimit: 60e6,
    }
  );

  const data = treasuryManger.interface.encodeFunctionData(
    'reinvestVaultReward',
    'claimAndReinvestVaultReward',
    [
      vault.address,
      tradesPerRewardToken,
      poolClaimAmounts.map((amount) => amount.mul(99).div(100)), // minPoolClaims, 1% discounted poolClaimAmounts
    ]
  );

  console.log(
    `sending reinvestment tx to relayer from vault: ${vault.address}`
  );

  const tx = await sendTxThroughRelayer({
    to: treasuryManger.address,
    data,
    env,
  });

  await setLastTransaction(env, vault.address, tx);
};

const claimAndReinvestRewards = async (env: Env, provider: Provider) => {
  const errors: Error[] = [];
  const vaults = getVaultsForReinvestment(env.NETWORK);
  for (const vault of vaults) {
    try {
      await claimAndReinvestVault(env, provider, vault);
    } catch (err) {
      console.error(`Reinvestment for vault: ${vault.address} failed`);
      console.error(err);
      errors.push(err as Error);
    }
  }

  return errors;
};

enum Action {
  claim = 'claim',
  reinvestment = 'reinvestment',
}

function getQueryParams(request: Request) {
  const { searchParams } = new URL(request.url);

  return {
    network: searchParams.get('network') as Exclude<Network, Network.all>,
    vaultAddress: searchParams.get('vaultAddress'),
    action: searchParams.get('action') as Action,
    force: !!searchParams.get('force'),
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (authKey !== env.AUTH_KEY) {
      return new Response(null, { status: 401 });
    }
    const { network, vaultAddress, force } = getQueryParams(request);

    if (!network || !vaultAddress) {
      return new Response('Missing required query parameters', { status: 400 });
    }

    const vaults = getVaultsForReinvestment(network, force);
    const vault = vaults.find(
      (v) => v.address.toLowerCase() === vaultAddress.toLowerCase()
    );
    if (!vault) {
      return new Response('Unknown vault address or vault is not whitelisted', {
        status: 404,
      });
    }

    env.NETWORK = network;
    env.LOGGER = new Logger({
      service: 'rewards',
      version: 'v1',
      env: env.NETWORK,
      apiKey: env.NX_DD_API_KEY,
    });
    const provider = getProviderFromNetwork(env.NETWORK, true);

    await claimAndReinvestVault(env, provider, vault, force);

    return new Response('OK');
  },
  // this method can be only call by cloudflare internal system so it does not
  // require any authentication
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    const allErrors: Error[] = [];
    for (const network of env.NETWORKS) {
      env.NETWORK = network;
      env.LOGGER = new Logger({
        service: 'rewards',
        version: 'v1',
        env: env.NETWORK,
        apiKey: env.NX_DD_API_KEY,
      });

      console.log(`Processing network: ${env.NETWORK}`);
      const provider = getProviderFromNetwork(env.NETWORK, true);

      const errors = await claimAndReinvestRewards(env, provider);
      allErrors.push(...errors);
    }
    // if any of the claims/reinvestment failed, throw error here so worker execution can be properly
    // marked as failed and alarms can be triggered
    if (allErrors.length) {
      throw allErrors[0];
    }
  },
};
