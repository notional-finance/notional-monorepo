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
}

enum Sign {
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
  },
  arbitrum: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER]: [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward, Sign.harvestAssetsFromNotional, Sign.executeTrade],
    [Address.AaveV3Pool_ARBITRUM]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_ARBITRUM]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_ARBITRUM]: [Sign.settleAccounts, Sign.settleVaultsAccounts],
  },
  sepolia: {
    [Address.AaveFlashLiquidator_ARBITRUM]: [Sign.flashLiquidate],
    [Address.TREASURY_MANAGER]: [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward],
    [Address.AaveV3Pool_ARBITRUM]: [Sign.flashLoan],
    [Address.Multicall3]: [Sign.aggregate3],
    [Address.initializeAllMarkets_ARBITRUM]: [Sign.initializeAllMarkets],
    [Address.settleAccounts_ARBITRUM]: [Sign.settleAccounts, Sign.settleVaultsAccounts],
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
};

function getTxType({ signature }: { signature: Sign }) {
  if ([Sign.flashLoan, Sign.flashLiquidate, Sign.settleVaultsAccounts, Sign.settleAccounts, Sign.initializeAllMarkets].includes(signature)) {
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

async function logToDataDog(message: any) {
  return fetch("https://http-intake.logs.datadoghq.com/api/v2/logs", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'DD-API-KEY': process.env.DD_API_KEY as string
    },
    body: JSON.stringify({
      ddsource: "tx-relay",
      service: "signer",
      message
    })
  }).catch(err => console.error(err));
}

// will only work properly if node app is not run in cluster
const throttle = (() => {
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
  const delay = 2000;
  const lastCallPerDomain = new Map();

  return async (domain: string) => {
    while (Date.now() < (lastCallPerDomain.get(domain) || 0) + delay) {
      await wait(delay - (Date.now() - (lastCallPerDomain.get(domain) || 0)));
    }
    lastCallPerDomain.set(domain, Date.now());
  };
})();

export async function sendTransaction({ to, data, gasLimit, network }: { to: string, data: string, gasLimit: number, network: string }) {
  to = to.toLowerCase();
  const signature = data.slice(0, 10) as Sign;
  if (
    !whitelist[network][to] ||
    !whitelist[network][to].includes(signature)
  ) {
    throw new Error(`Call to: ${to} method: ${signature} on network: ${network} is not allowed`);
  }

  // in order to properly fetch correct nonce for tx we need to throttle here per key
  await throttle(keysToUse[to]);

  const provider = ethers.getDefaultProvider(rpcUrls[network]);

  const signer = new GcpKmsSigner({ ...kmsCredentials, keyId: keysToUse[to] }).connect(provider);

  const tx = await signer.sendTransaction({
    to,
    data,
    gasLimit: Number.isInteger(Number(gasLimit)) ? gasLimit : undefined,
  });

  await logToDataDog({
    txType: getTxType({ signature: signature }),
    signature,
    network,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    gasLimit: tx.gasLimit?.toString(),
    gasPrice: tx.gasPrice?.toString(),
  });

  return tx;
}

export async function getAllSignerAddresses() {
  return {
    [Key.reinvestment]: await (new GcpKmsSigner({ ...kmsCredentials, keyId: Key.reinvestment })).getAddress(),
    [Key.liquidation]: await (new GcpKmsSigner({ ...kmsCredentials, keyId: Key.liquidation })).getAddress(),
  }
}

