import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider"
import { ethers } from "ethers";
import { GcpKmsSigner } from "ethers-gcp-kms-signer";
import { Network } from "./types";

const kmsCredentials = {
  projectId: "monitoring-agents", // your project id in gcp
  locationId: "global", // the location where your key ring was created
  keyRingId: "autotasks", // the id of the key ring
  keyId: "", // the name/id of your key in the key ring
  keyVersion: "1", // the version of the key
};

const rpcUrls = {
  mainnet: "https://rpc.mevblocker.io",
  arbitrum: "https://arb-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z",
  sepolia: "https://eth-sepolia.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z",
}
enum Key {
  reinvestment = 'reinvestment',
  liquidation = 'liquidation-2'
}

// addresses need to be lowercased
const Address = {
  TREASURY_MANAGER: '0x53144559c0d4a3304e2dd9dafbd685247429216d'.toLowerCase(),
  AaveV3Pool_ARBITRUM: '0x794a61358d6845594f94dc1db02a252b5b4814ad'.toLowerCase(),
  AaveV3Pool_MAINNET: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'.toLowerCase(),
  AaveFlashLiquidator_MAINNET: '0xb33e0b9e5ff443fdfe48d8a49f45828918bdab8c'.toLowerCase(),
  AaveFlashLiquidator_ARBITRUM: '0x78e41d1389f3db7c196f13088d1f99a319ffcfbe'.toLowerCase(),
  Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11'.toLowerCase(),
  initializeAllMarkets_ARBITRUM: '0x9b6C04D1481473B2e52CaEB85822072C35460f27'.toLowerCase(),
  settleAccounts_ARBITRUM: '0x22349F0b9b6294dA5526c9E9383164d97c45ACCD'.toLowerCase(),

  AaveWrappedFlashLender_MAINNET: '0x0c86c636ed5593705b5675d370c831972C787841'.toLowerCase(),
  BalancerWrappedFlashLender_MAINNET: '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E'.toLowerCase(),
  UniV3WrappedFlashLender_MAINNET: '0x319300462C37AD2D4f26B584C2b67De51F51f289'.toLowerCase(),
  AaveWrappedFlashLender_ARBITRUM: '0x9D4D2C08b29A2Db1c614483cd8971734BFDCC9F2'.toLowerCase(),
  BalancerWrappedFlashLender_ARBITRUM: '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E'.toLowerCase(),
  CamelotWrappedFlashLender_ARBITRUM: '0x5E8820B2832aD8451f65Fa2CCe2F3Cef29016D0d'.toLowerCase(),
  UniV3WrappedFlashLender_ARBITRUM: '0x319300462C37AD2D4f26B584C2b67De51F51f289'.toLowerCase(),
}

enum Sign {
  flash = '0xaf2511c0',
  flashLoan = '0xab9c4b5d',
  flashLiquidate = '0x7bbeeafd',
  claimVaultRewardTokens = '0x36e8053c',
  reinvestVaultReward = '0xe800d559',
  investWETHAndNOTE = '0x162c2a8e',
  executeTrade = '0x8df6c3ce',
  aggregate3 = '0x82ad56cb',
  harvestAssetsFromNotional = '0x295732fb',
  initializeAllMarkets = '0x9f8fad32',
  settleAccounts = '0xd7f4893e',
  settleVaultsAccounts = '0x8261f4ba',
}

const whitelist: Record<Network, Partial<Record<string, Sign[]>>> = {
  mainnet: {
    [Address.AaveFlashLiquidator_MAINNET]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER]: [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward, Sign.investWETHAndNOTE, Sign.executeTrade],
    [Address.AaveV3Pool_MAINNET]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.AaveWrappedFlashLender_MAINNET]: [Sign.flash],
    [Address.BalancerWrappedFlashLender_MAINNET]: [Sign.flash],
    [Address.UniV3WrappedFlashLender_MAINNET]: [Sign.flash],
  },
  arbitrum: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER]: [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward, Sign.harvestAssetsFromNotional, Sign.executeTrade],
    [Address.AaveV3Pool_ARBITRUM]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_ARBITRUM]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_ARBITRUM]: [Sign.settleAccounts, Sign.settleVaultsAccounts],
    [Address.AaveWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.BalancerWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.UniV3WrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.CamelotWrappedFlashLender_ARBITRUM]: [Sign.flash],
  },
  sepolia: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER]: [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward],
    [Address.AaveV3Pool_ARBITRUM]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_ARBITRUM]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_ARBITRUM]: [Sign.settleAccounts, Sign.settleVaultsAccounts],
    [Address.AaveWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.BalancerWrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.UniV3WrappedFlashLender_ARBITRUM]: [Sign.flash],
    [Address.CamelotWrappedFlashLender_ARBITRUM]: [Sign.flash],
  }
}

const keysToUse = {
  [Address.TREASURY_MANAGER]: Key.reinvestment,
  [Address.AaveV3Pool_ARBITRUM]: Key.liquidation,
  [Address.AaveV3Pool_MAINNET]: Key.liquidation,
  [Address.AaveFlashLiquidator_ARBITRUM]: Key.liquidation,
  [Address.AaveFlashLiquidator_MAINNET]: Key.liquidation,
  [Address.Multicall3]: Key.liquidation,
  [Address.initializeAllMarkets_ARBITRUM]: Key.liquidation,
  [Address.settleAccounts_ARBITRUM]: Key.liquidation,

  [Address.AaveWrappedFlashLender_MAINNET]: Key.liquidation,
  [Address.BalancerWrappedFlashLender_MAINNET]: Key.liquidation,
  [Address.UniV3WrappedFlashLender_MAINNET]: Key.liquidation,

  [Address.AaveWrappedFlashLender_ARBITRUM]: Key.liquidation,
  [Address.BalancerWrappedFlashLender_ARBITRUM]: Key.liquidation,
  [Address.UniV3WrappedFlashLender_ARBITRUM]: Key.liquidation,
  [Address.CamelotWrappedFlashLender_ARBITRUM]: Key.liquidation,
};

function getTxType({ signature }: { signature: Sign }) {
  if ([Sign.flash, Sign.flashLoan, Sign.flashLiquidate, Sign.settleVaultsAccounts, Sign.settleAccounts, Sign.initializeAllMarkets].includes(signature)) {
    return 'liquidation';
  }
  if ([Sign.claimVaultRewardTokens, Sign.reinvestVaultReward].includes(signature)) {
    return 'reinvestment';
  }
  if ([Sign.executeTrade, Sign.investWETHAndNOTE].includes(signature)) {
    return 'burnNote';
  }
  if ([Sign.harvestAssetsFromNotional].includes(signature)) {
    return 'harvesting';
  }
  if ([Sign.settleVaultsAccounts, Sign.settleAccounts, Sign.initializeAllMarkets].includes(signature)) {
    return 'initialize-markets';
  }
  return 'unknown';
}

async function logToDataDog(message: any, ddtags = '') {
  return fetch("https://http-intake.logs.datadoghq.com/api/v2/logs", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'DD-API-KEY': process.env.DD_API_KEY as string
    },
    body: JSON.stringify({
      ddsource: "tx-relay",
      ddtags,
      service: "signer",
      message
    })
  }).catch(err => console.error(err));
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
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

export async function sendTransaction({ to, data, gasLimit, nonce, network }: { to: string, data: string, nonce: number, gasLimit: number, network: string }) {
  to = to.toLowerCase();
  const signature = data.slice(0, 10) as Sign;

  let sharedLogData: any = {
    txType: getTxType({ signature: signature }),
    signature,
    network,
    to,
  };

  if (
    !whitelist[network][to] ||
    !whitelist[network][to].includes(signature)
  ) {
    const errorMessage = `Call to: ${to} method: ${signature} on network: ${network} is not allowed`;
    await logToDataDog({ ...sharedLogData, err: errorMessage, status: 'error', }, 'event:txn_failed');

    throw new Error(errorMessage);
  }

  // in order to properly fetch correct nonce for tx we need to throttle here per key
  await throttle(keysToUse[to]);

  const provider = ethers.getDefaultProvider(rpcUrls[network]);

  const signer = new GcpKmsSigner({ ...kmsCredentials, keyId: keysToUse[to] }).connect(provider);

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
    await logToDataDog({
      ...sharedLogData,
      retry,
      err: JSON.stringify(err),
      status: 'error',
    }, 'event:txn_failed');
    try {
      retry++;
      // second attempt, in case nonce was stale
      await wait(1000);
      txResponse = await signer.sendTransaction(transaction);
    } catch (err) {
      await logToDataDog({
        ...sharedLogData,
        retry,
        err: JSON.stringify(err),
        status: 'error',
      }, 'event:txn_failed');

      throw err;
    }

  }

  await logToDataDog({
    ...sharedLogData,
    hash: txResponse.hash,
    gasLimit: txResponse.gasLimit?.toString(),
    gasPrice: txResponse.gasPrice?.toString(),
    status: 'success',
    retry,
  });

  return txResponse;
}

export async function getAllSignerAddresses() {
  return {
    [Key.reinvestment]: await (new GcpKmsSigner({ ...kmsCredentials, keyId: Key.reinvestment })).getAddress(),
    [Key.liquidation]: await (new GcpKmsSigner({ ...kmsCredentials, keyId: Key.liquidation })).getAddress(),
  }
}

