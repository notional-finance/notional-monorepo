import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { ethers, providers } from 'ethers';
import { GcpKmsSigner } from 'ethers-gcp-kms-signer';
import { Address, Sign, rpcUrls } from './config';
import { Network } from './types';
import { logToDataDog } from './util';

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
  [Address.TREASURY_MANAGER]: Key.reinvestment,
  [Address.REBALANCE_HELPER]: Key.reinvestment,
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
    [Address.TREASURY_MANAGER]: [
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
    [Address.TREASURY_MANAGER]: [
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
  },
  sepolia: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER]: [
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
    [Address.REBALANCE_HELPER]: [Sign.checkAndRebalance],
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
// will only work properly if node app is not run in cluster
const throttle = (() => {
  const delay = 2000;
  const lastCallPerDomain = new Map();

  return async (domain: string) => {
    while (Date.now() < (lastCallPerDomain.get(domain) || 0) + delay) {
      await wait(delay - (Date.now() - (lastCallPerDomain.get(domain) || 0)));
    }
    lastCallPerDomain.set(domain, Date.now());
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

  // in order to properly fetch correct nonce for tx we need to throttle here per key
  await throttle(keysToUse[to]);

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

  let txResponse: TransactionResponse;
  let retry = 0;
  try {
    // first attempt
    txResponse = await signer.sendTransaction(transaction);
  } catch (err) {
    try {
      retry++;
      // second attempt, in case nonce was stale
      await wait(1000);
      txResponse = await signer.sendTransaction(transaction);
    } catch (err) {
      await log({
        message: {
          ...sharedLogData,
          retry,
          err: JSON.stringify(err),
          status: 'error',
        },
        tags: 'event:txn_failed',
      });

      throw err;
    }
  }

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
