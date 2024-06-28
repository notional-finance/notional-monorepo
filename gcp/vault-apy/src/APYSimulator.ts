import { exec } from 'child_process';
import assert from 'node:assert/strict';
import { ethers, BigNumber, Contract } from 'ethers';
import {
  TradingModuleInterface,
  SingleSidedLPVault,
  TransferInterface,
  ERC20Interface,
  AuraGaugeInterface,
  ConvexGaugeArbitrumInterface,
  ConvexGaugeMainnetInterface,
  CurveGaugeInterface,
} from './interfaces';
import {
  Network,
  Provider,
  RewardPoolType,
  VaultData,
  JsonRpcProvider,
  TransferLog,
} from './types';
import { Oracle } from './oracles';
import { getPoolFees } from './fees';
import configPerNetwork, { Config, POOL_DECIMALS } from './config';
import {
  getTokenDecimals,
  e,
  execPromise,
  wait,
  floorToMidnight,
} from './util';

const log = require('debug')('vault-apy');

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

async function getTransferLogs(logs: ethers.providers.Log[]) {
  const transfers: TransferLog[] = [];
  for (const log of logs) {
    try {
      const parsed = TransferInterface.parseLog(log);
      transfers.push({
        token: log.address,
        from: parsed.args.from,
        to: parsed.args.to,
        amount: parsed.args.amount.toString(),
      });
    } catch {}
  }
  return transfers;
}

async function getTokenDetails(tokenAddress: string, provider: Provider) {
  const token = new Contract(tokenAddress, ERC20Interface, provider);
  return {
    decimals: await token.callStatic.decimals(),
    symbol: await token.callStatic.symbol(),
  };
}

export default class APYSimulator {
  #network: Network;
  #config: Config;
  #alchemyProvider: JsonRpcProvider;

  constructor(network: Network) {
    this.#network = network;
    this.#config = configPerNetwork[network];
    this.#alchemyProvider = new ethers.providers.JsonRpcProvider(
      this.#config.alchemyUrl
    );
  }

  async runHistorical(numOfDays: number, startingDate: Date = new Date()) {
    if (!this.#config.vaults.length) {
      log('Skipping, no vaults specified');
      return;
    }
    const startingTimestamp = startingDate.getTime() / 1000;
    for (let i = 1; i <= numOfDays; i++) {
      log(`processing day ${i}, ${startingTimestamp - i * ONE_DAY_IN_SECONDS}`);
      const forkBlock = await this.#getBlockAtTimestamp(
        startingTimestamp - i * ONE_DAY_IN_SECONDS
      );

      await this.run(forkBlock);
    }
  }
  async runHistoricalForVault(
    vaultAddress: string,
    numOfDays: number,
    startingDate: Date = new Date()
  ) {
    if (!this.#config.vaults.length) {
      log('Skipping, no vaults specified');
      return;
    }
    const startingTimestamp = startingDate.getTime() / 1000;
    for (let i = 0; i <= numOfDays; i++) {
      log(`processing day ${i}`);
      const forkBlock = await this.#getBlockAtTimestamp(
        startingTimestamp - i * ONE_DAY_IN_SECONDS
      );

      await this.run(forkBlock, vaultAddress);
    }
  }

  async run(_forkBlock: number = 0, vaultAddress: string | null = null) {
    if (!this.#config.vaults.length) {
      log('Skipping, no vaults specified');
      return;
    }
    const forkBlock =
      _forkBlock || (await this.#alchemyProvider.getBlockNumber());
    const { rpcUrl } = await this.#spawnAnvil(forkBlock);

    let provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      this.#config.chainId
    );
    // we can't call getExchangeRate when we warp into future without extending freshness
    await this.#extendMaxOracleFreshness(provider);

    const allResults: any[] = [];
    for (const vaultData of this.#config.vaults) {
      // skip all other vaults if vault address was explicitly specified
      if (
        vaultAddress &&
        vaultData.address.toLowerCase() !== vaultAddress?.toLowerCase()
      ) {
        continue;
      }
      // new provider instance needs to be created inside the loop otherwise it wont work
      // properly when chain is reverted to checkpoint
      provider = new ethers.providers.JsonRpcProvider(
        rpcUrl,
        this.#config.chainId
      );
      // we need to created new checkpoint each time since it is deleted after revert
      let checkpoint = await provider.send('evm_snapshot', []);

      const vault = new Contract(
        vaultData.address,
        SingleSidedLPVault,
        provider
      );
      // attach additional data
      vaultData.pool =
        vaultData.pool || (await vault.getStrategyVaultInfo())[0];

      const results = await this.#calculateFutureAPY(
        provider,
        vaultData as VaultData
      );
      allResults.push(...results);

      await provider.send('evm_revert', [checkpoint]);
    }

    await this.#saveToDb(allResults);
  }

  async #calculateFutureAPY(provider: JsonRpcProvider, vaultData: VaultData) {
    let account = vaultData.address;
    let totalLpTokens = await this.#getTotalLpTokensForAccount(
      account,
      vaultData,
      provider
    );
    if (totalLpTokens.eq(0)) {
      log(
        'vault does not exist or do not have lp tokens, finding another account for APY calculation'
      );
      account = await this.#findGaugeTokenHolder(vaultData, provider);
      log(`new account: ${account}`);
      totalLpTokens = await this.#getTotalLpTokensForAccount(
        account,
        vaultData,
        provider
      );
    }
    assert(!totalLpTokens.eq(0));
    const isAccountVault = vaultData.address === account;

    const prevBlock = await provider.getBlock('latest');
    await provider.send('anvil_setBalance', [
      account,
      `0x${Number(1e18).toString(16)}`,
    ]);
    await this.#claimRewardFromGauge(account, vaultData, provider);
    // warp 24 hours into future
    await provider.send('evm_increaseTime', [
      ethers.utils.hexValue(ONE_DAY_IN_SECONDS),
    ]);
    const tx = await this.#claimRewardFromGauge(account, vaultData, provider);

    const block = await provider.getBlock('latest');
    // used to query defiLlama api
    let priceAtTimestamp = block.timestamp;
    if (priceAtTimestamp > Date.now() / 1000) {
      priceAtTimestamp = prevBlock.timestamp;
    }

    const oracle = new Oracle(this.#network, priceAtTimestamp);

    const blockNumber = await this.#getBlockAtTimestamp(priceAtTimestamp);
    const poolData = await getPoolFees(
      this.#network,
      oracle,
      vaultData,
      blockNumber,
      provider
    );

    const primaryBorrowDecimals = await getTokenDecimals(
      vaultData.primaryBorrowCurrency,
      provider
    );
    const poolFeesInPrimary = totalLpTokens
      .mul(poolData.feesPerShareInPrimary)
      // switch to primary borrow precision
      .mul(e(primaryBorrowDecimals))
      .div(e(POOL_DECIMALS))
      .div(e(poolData.decimals));

    const lpTokenValuePrimaryBorrowAlt = isAccountVault
      ? await this.#getVaultValueInPrimary(vaultData.address, provider)
      : null;

    const lpTokenValuePrimaryBorrow = totalLpTokens
      .mul(e(primaryBorrowDecimals))
      .mul(poolData.poolValuePerShareInPrimary)
      .div(e(POOL_DECIMALS))
      .div(e(poolData.decimals));

    const rewardTokens = await this.#processTransferLogs(tx, account, provider);

    const sharedData = {
      /////////////////local log, not saved to db/////////////////////////
      feeApy: `${
        Number(
          poolFeesInPrimary
            .mul(365)
            .mul(1_000_000)
            .div(lpTokenValuePrimaryBorrow)
            .toString()
        ) / 10_000
      }%`,
      ...(isAccountVault && {
        vaultName: await new Contract(
          vaultData.address,
          SingleSidedLPVault,
          provider
        ).name(),
      }),
      network: this.#network,
      date: new Date(prevBlock.timestamp * 1000).toISOString(),
      ///////////////////////////////////////////////////////////////////////

      swapFees: poolFeesInPrimary.toString(),
      blockNumber: prevBlock.number,
      timestamp: floorToMidnight(prevBlock.timestamp),
      vaultAddress: vaultData.address.toLowerCase(),
      poolValuePerShareInPrimary:
        poolData.poolValuePerShareInPrimary.toString(),
      totalLpTokens: totalLpTokens.toString(),
      lpTokenValuePrimaryBorrow: lpTokenValuePrimaryBorrow.toString(),
      lpTokenValuePrimaryBorrowAlt: isAccountVault
        ? lpTokenValuePrimaryBorrowAlt.toString()
        : null,
      noVaultShares: !isAccountVault,
    };

    const allResults: any[] = [];
    for (let [token, tokensClaimed] of rewardTokens) {
      const { decimals: tokenDecimals, symbol } = await getTokenDetails(
        token,
        provider
      );
      const { price: priceInPrimary, decimals: priceDecimals } =
        await oracle.getPrice(token, vaultData.primaryBorrowCurrency);
      const rewardTokenValuePrimaryBorrow = BigNumber.from(tokensClaimed)
        .mul(priceInPrimary)
        .div(
          BigNumber.from(10).pow(
            priceDecimals + tokenDecimals - primaryBorrowDecimals
          )
        );

      const result = {
        /////////////////local log, not saved to db/////////////////////////
        apy: `${
          Number(
            rewardTokenValuePrimaryBorrow
              .mul(365)
              .mul(10_00000)
              .div(lpTokenValuePrimaryBorrow)
              .toString()
          ) / 10000
        }%`,
        ///////////////////////////////////////////////////////////////////////

        ...sharedData,
        rewardToken: token.toLowerCase(),
        rewardTokensClaimed: tokensClaimed.toString(),
        rewardTokenValuePrimaryBorrow: rewardTokenValuePrimaryBorrow.toString(),
        rewardTokenSymbol: symbol,
      };
      log(result);
      allResults.push(result);
    }

    if (poolFeesInPrimary) {
      const feeResult = {
        ...sharedData,
        rewardToken: 'Swap Fees',
        rewardTokenSymbol: 'Swap Fees',
        rewardTokenValuePrimaryBorrow: poolFeesInPrimary.toString(),
      };
      allResults.push(feeResult);
      log(feeResult);
    }

    return allResults;
  }

  async #spawnAnvil(forkBlock: number) {
    await execPromise('pkill anvil').catch(() =>
      log('No running anvil instances')
    );

    log(`spawning network on block ${forkBlock}`);
    exec(
      `anvil --rpc-url ${
        this.#config.alchemyUrl
      } --fork-block-number ${forkBlock}`
    );
    await wait(5000);

    return { rpcUrl: 'http://127.0.0.1:8545' };
  }

  async #extendMaxOracleFreshness(provider: JsonRpcProvider) {
    const notionalOwner = this.#config.addresses.notionalOwner;
    await provider.send('anvil_setBalance', [
      notionalOwner,
      `0x${Number(1e18).toString(16)}`,
    ]);
    await provider.send('anvil_impersonateAccount', [notionalOwner]);
    await provider.send('eth_sendTransaction', [
      {
        from: notionalOwner,
        to: this.#config.addresses.tradingModule,
        data: TradingModuleInterface.encodeFunctionData(
          'setMaxOracleFreshness',
          ['4294967295']
        ),
      },
    ]);
  }

  async #findGaugeTokenHolder(vaultData: VaultData, provider: Provider) {
    const latestBlock = await provider.getBlockNumber();
    let logs: { transfers: { from: string; to: string }[] };
    if (vaultData.rewardPoolType === RewardPoolType.ConvexMainnet) {
      logs = await this.#alchemyProvider.send('alchemy_getAssetTransfers', [
        {
          // convex voter proxy
          toAddress: '0x989AEb4d175e16225E39E87d0D97A3360524AD80',
          contractAddresses: [vaultData.pool],
          category: ['erc20'],
          order: 'desc',
          toBlock: `0x${latestBlock.toString(16)}`,
          maxCount: `0x${Number(100).toString(16)}`,
        },
      ]);
      // filter out gauge deposit token
      return logs.transfers.filter(
        (t) => t.from !== '0x4717c25df44e280ec5b31acbd8c194e1ed24efe2'
      )[0].from;
    } else {
      logs = await this.#alchemyProvider.send('alchemy_getAssetTransfers', [
        {
          fromAddress: '0x0000000000000000000000000000000000000000',
          contractAddresses: [vaultData.gauge],
          category: ['erc20'],
          order: 'desc',
          toBlock: `0x${latestBlock.toString(16)}`,
          maxCount: `0x${Number(1).toString(16)}`,
        },
      ]);
      return logs.transfers[0].to;
    }
  }

  async #claimRewardFromGauge(
    account: string,
    vaultData: VaultData,
    provider: JsonRpcProvider
  ) {
    const claimData = this.#getClaimData(account, vaultData);
    await provider.send('anvil_impersonateAccount', [account]);
    return provider.send('eth_sendTransaction', [
      { from: account, to: vaultData.gauge, data: claimData },
    ]);
  }

  async #processTransferLogs(
    tx: any,
    account: string,
    provider: JsonRpcProvider
  ) {
    const claimLogs = await provider
      .getTransactionReceipt(tx)
      .then((r) => r.logs);
    const transfersToVault = await getTransferLogs(claimLogs).then((r) =>
      r.filter((l) => l.to.toLowerCase() === account.toLowerCase())
    );

    const rewardTokens: Map<string, BigNumber> = new Map();
    for (const transfer of transfersToVault) {
      const tokensClaimed =
        rewardTokens.get(transfer.token) || BigNumber.from(0);
      rewardTokens.set(transfer.token, tokensClaimed.add(transfer.amount));
    }

    return rewardTokens;
  }

  async #getVaultValueInPrimary(vaultAddress: string, provider: Provider) {
    const vault = new Contract(vaultAddress, SingleSidedLPVault, provider);
    const totalVaultShares = await vault.callStatic
      .getStrategyVaultInfo()
      .then((r) => r.totalVaultShares);
    const pricePerShare = await vault.callStatic.getExchangeRate(0);
    return totalVaultShares.mul(pricePerShare).div(1e8);
  }

  async #getTotalLpTokensForAccount(
    account: string,
    vaultData: VaultData,
    provider: Provider
  ): Promise<BigNumber> {
    if (vaultData.rewardPoolType === RewardPoolType.Aura) {
      const aura = new Contract(vaultData.gauge, AuraGaugeInterface, provider);
      return aura.convertToAssets(aura.balanceOf(account));
    }
    if (vaultData.rewardPoolType == RewardPoolType.ConvexArbitrum) {
      const convex = new Contract(
        vaultData.gauge,
        ConvexGaugeArbitrumInterface,
        provider
      );
      return convex.balanceOf(account);
    }
    if (vaultData.rewardPoolType == RewardPoolType.ConvexMainnet) {
      const convex = new Contract(
        vaultData.gauge,
        ConvexGaugeMainnetInterface,
        provider
      );
      return convex.balanceOf(account);
    }
    if (vaultData.rewardPoolType == RewardPoolType.Curve) {
      const curve = new Contract(
        vaultData.gauge,
        CurveGaugeInterface,
        provider
      );
      return curve.balanceOf(account);
    }
    throw new Error('Unsupported vault type');
  }

  #getClaimData(account: string, vaultData: VaultData) {
    if (vaultData.rewardPoolType === RewardPoolType.Aura) {
      return AuraGaugeInterface.encodeFunctionData('getReward');
    }
    if (vaultData.rewardPoolType == RewardPoolType.ConvexArbitrum) {
      return ConvexGaugeArbitrumInterface.encodeFunctionData('getReward', [
        account,
      ]);
    }
    if (vaultData.rewardPoolType == RewardPoolType.ConvexMainnet) {
      return ConvexGaugeMainnetInterface.encodeFunctionData('getReward');
    }
    if (vaultData.rewardPoolType == RewardPoolType.Curve) {
      return CurveGaugeInterface.encodeFunctionData('claim_rewards');
    }
    throw new Error('Unsupported vault type');
  }

  // get block closest to the specified timestamp
  async #getBlockAtTimestamp(timestamp: number) {
    const network =
      this.#network === Network.mainnet ? 'ethereum' : this.#network;

    return fetch(
      `https://coins.llama.fi/block/${network}/${timestamp.toFixed(0)}`
    )
      .then((r) => r.json() as Promise<{ height: number; timestamp: number }>)
      .then((r) => r.height);
  }

  async #saveToDb(reports: any[]) {
    if (!reports.length) {
      log('nothing to save');
      return;
    }
    const response = await fetch(this.#config.dataServiceUrl, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': process.env.DATA_SERVICE_AUTH_TOKEN as string,
      },
      method: 'POST',
      body: JSON.stringify({
        network: this.#network,
        vaultAPYs: reports,
      }),
    });
    if (!response.ok) {
      console.error(response.status, response.statusText);
      throw new Error('Save to db failed');
    }
  }
}
