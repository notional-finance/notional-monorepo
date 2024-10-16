import { TransactionRequest } from '@ethersproject/abstract-provider';
import { ethers, providers } from 'ethers';
import { GcpKmsSigner } from 'ethers-gcp-kms-signer';
import { Address, Sign, rebalanceHelperAddresses, rpcUrls } from './config';
import { Network } from './types';
import { logToDataDog } from './util';
import { TransactionResponse } from '@ethersproject/providers';

const TEST_CHAIN_ID = 111111;

const kmsCredentials = {
  projectId: 'monitoring-agents', // your project id in gcp
  locationId: 'global', // the location where your key ring was created
  keyRingId: 'autotasks', // the id of the key ring
  keyId: '', // the name/id of your key in the key ring
  keyVersion: '1', // the version of the key
};

enum Key {
  reinvestment = 'reinvestment',
  liquidation = 'liquidation-2',
}

const keysToUse = {
  [Address.TREASURY_MANAGER_MAINNET]: Key.reinvestment,
  [Address.TREASURY_MANAGER_ARBITRUM]: Key.reinvestment,
  [rebalanceHelperAddresses[Network.arbitrum]]: Key.reinvestment,
  [Address.AaveV3Pool_ARBITRUM]: Key.liquidation,
  [Address.AaveV3Pool_MAINNET]: Key.liquidation,
  [Address.AaveFlashLiquidator_ARBITRUM]: Key.liquidation,
  [Address.AaveFlashLiquidator_MAINNET]: Key.liquidation,
  [Address.Multicall3]: Key.liquidation,
  [Address.initializeAllMarkets_ARBITRUM]: Key.liquidation,
  [Address.settleAccounts_ARBITRUM]: Key.liquidation,
  [Address.initializeAllMarkets_MAINNET]: Key.liquidation,
  [Address.settleAccounts_MAINNET]: Key.liquidation,

  [Address.AaveWrappedFlashLender_MAINNET]: Key.liquidation,
  [Address.BalancerWrappedFlashLender_MAINNET]: Key.liquidation,
  [Address.UniV3WrappedFlashLender_MAINNET]: Key.liquidation,

  [Address.AaveWrappedFlashLender_ARBITRUM]: Key.liquidation,
  [Address.BalancerWrappedFlashLender_ARBITRUM]: Key.liquidation,
  [Address.UniV3WrappedFlashLender_ARBITRUM]: Key.liquidation,
  [Address.CamelotWrappedFlashLender_ARBITRUM]: Key.liquidation,
};

const whitelist: Record<Network, Partial<Record<string, Sign[]>>> = {
  mainnet: {
    [Address.AaveFlashLiquidator_MAINNET]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER_MAINNET]: [
      Sign.claimVaultRewardTokens,
      Sign.reinvestVaultReward,
      Sign.investWETHAndNOTE,
      Sign.executeTrade,
    ],
    [Address.AaveV3Pool_MAINNET]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_MAINNET]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_MAINNET]: [
      Sign.settleAccounts,
      Sign.settleVaultsAccounts,
    ],
    [Address.AaveWrappedFlashLender_MAINNET]: [Sign.flash],
    [Address.BalancerWrappedFlashLender_MAINNET]: [Sign.flash],
    [Address.UniV3WrappedFlashLender_MAINNET]: [Sign.flash],
  },
  arbitrum: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER_ARBITRUM]: [
      Sign.claimVaultRewardTokens,
      Sign.reinvestVaultReward,
      Sign.harvestAssetsFromNotional,
      Sign.executeTrade,
    ],
    [Address.AaveV3Pool_ARBITRUM]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_ARBITRUM]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_ARBITRUM]: [
      Sign.settleAccounts,
      Sign.settleVaultsAccounts,
    ],
    [Address.AaveWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.BalancerWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.UniV3WrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.CamelotWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [rebalanceHelperAddresses[Network.arbitrum]]: [Sign.checkAndRebalance],
  },
  sepolia: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER_ARBITRUM]: [
      Sign.claimVaultRewardTokens,
      Sign.reinvestVaultReward,
    ],
    [Address.AaveV3Pool_ARBITRUM]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_ARBITRUM]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_ARBITRUM]: [
      Sign.settleAccounts,
      Sign.settleVaultsAccounts,
    ],
    [Address.AaveWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.BalancerWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.UniV3WrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.CamelotWrappedFlashLender_ARBITRUM]: [Sign.flash],
  },
};

function getTxType({ signature }: { signature: Sign }) {
  if ([Sign.flash, Sign.flashLoan, Sign.flashLiquidate].includes(signature)) {
    return 'liquidation';
  }
  if (
    [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward].includes(signature)
  ) {
    return 'reinvestment';
  }
  if ([Sign.executeTrade, Sign.investWETHAndNOTE].includes(signature)) {
    return 'burnNote';
  }
  if ([Sign.harvestAssetsFromNotional].includes(signature)) {
    return 'harvesting';
  }
  if (
    [
      Sign.settleVaultsAccounts,
      Sign.settleAccounts,
      Sign.initializeAllMarkets,
    ].includes(signature)
  ) {
    return 'initialize-markets';
  }
  if ([Sign.checkAndRebalance].includes(signature)) {
    return 'rebalance';
  }
  return 'unknown';
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
// tx-relayer is run as gcloud function with max-instances set to 1
// this implementation should work when function is not cold started
const acquireLock = (() => {
  const locks = new Map();

  return async (domain: string) => {
    // wait until lock is available or has expired
    while (Date.now() < (locks.get(domain) || 0)) {
      await wait(1000);
    }
    const lockUntil = Date.now() + 10000; // lock up to max of 10 seconds
    locks.set(domain, lockUntil);

    return () => {
      // delete lock only if it's the same lock
      if (locks.get(domain) === lockUntil) {
        locks.delete(domain);
      }
    };
  };
})();

interface TransactionParams {
  to: string;
  data: string;
  network: string;
  nonce?: number;
  gasLimit?: number;
}

interface ExecutionContext {
  provider?: providers.Provider;
  rpcUrl?: string;
  log: ReturnType<typeof logToDataDog>;
}

async function retryTransaction(
  signer: GcpKmsSigner,
  transaction: TransactionRequest,
  maxRetries: number
) {
  const BASE_DELAY = 1000; // 1 second
  // prevent stale nonce issues by acquiring a lock per key
  const releaseLock = await acquireLock(keysToUse[transaction.to as string]);
  try {
    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        const txResponse = await signer.sendTransaction(transaction);
        return { txResponse, retry };
      } catch (err) {
        if (retry === maxRetries) {
          throw err;
        }
        await wait(BASE_DELAY * Math.pow(2, retry));
      }
    }
  } finally {
    releaseLock();
  }
}

export async function sendTransaction(
  params: TransactionParams,
  context: ExecutionContext
) {
  const { data, gasLimit, nonce, network } = params;
  const { log } = context;
  const to = params.to.toLowerCase();
  const signature = data.slice(0, 10) as Sign;

  let sharedLogData = {
    txType: getTxType({ signature: signature }),
    signature,
    network,
    to,
    from: '',
  };

  if (!whitelist[network][to] || !whitelist[network][to].includes(signature)) {
    const errorMessage = `Call to: ${to} method: ${signature} on network: ${network} is not allowed`;
    await log(
      { ...sharedLogData, err: errorMessage, status: 'error' },
      { tags: 'event:txn_failed' }
    );

    throw new Error(errorMessage);
  }

  let provider: providers.Provider;
  if (context.rpcUrl) {
    provider = new ethers.providers.JsonRpcProvider(context.rpcUrl);
    const chainId = await provider
      .getNetwork()
      .then((network) => network.chainId);
    if (chainId !== TEST_CHAIN_ID) {
      throw new Error(
        `Custom rpc urls are supported only for chain id: ${TEST_CHAIN_ID}`
      );
    }
  } else {
    provider = context.provider || ethers.getDefaultProvider(rpcUrls[network]);
  }

  const signer = new GcpKmsSigner({
    ...kmsCredentials,
    keyId: keysToUse[to],
  }).connect(provider);

  const transaction: TransactionRequest = {
    to,
    data,
    nonce: Number.isInteger(Number(nonce)) ? nonce : undefined,
    gasLimit: Number.isInteger(Number(gasLimit)) ? gasLimit : undefined,
  };

  sharedLogData = {
    ...sharedLogData,
    from: await signer.getAddress(),
  };

  const MAX_RETRIES = 2;
  try {
    const { txResponse, retry } = (await retryTransaction(
      signer,
      transaction,
      MAX_RETRIES
    )) as { txResponse: TransactionResponse; retry: number };

    await log({
      message: {
        ...sharedLogData,
        hash: txResponse.hash,
        gasLimit: txResponse.gasLimit?.toString(),
        gasPrice: txResponse.gasPrice?.toString(),
        status: 'success',
        retry,
      },
    });
    return txResponse;
  } catch (err) {
    await log({
      message: {
        ...sharedLogData,
        retry: MAX_RETRIES,
        err: JSON.stringify(err),
        status: 'error',
      },
      tags: 'event:txn_failed',
    });
    throw err;
  }
}

export async function getAllSignerAddresses() {
  return {
    [Key.reinvestment]: await new GcpKmsSigner({
      ...kmsCredentials,
      keyId: Key.reinvestment,
    }).getAddress(),
    [Key.liquidation]: await new GcpKmsSigner({
      ...kmsCredentials,
      keyId: Key.liquidation,
    }).getAddress(),
  };
}
