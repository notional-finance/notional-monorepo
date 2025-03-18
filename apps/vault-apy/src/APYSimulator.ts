import debug from 'debug';
import { exec } from 'child_process';
import assert from 'node:assert/strict';
import { ethers, BigNumber, Contract, ContractTransaction } from 'ethers';
import {
  TradingModuleInterface,
  SingleSidedLPVault,
  TransferInterface,
  ERC20Interface,
  AuraGaugeInterface,
  ConvexGaugeArbitrumInterface,
  ConvexGaugeMainnetInterface,
  CurveGaugeInterface,
  NotionalInterface,
  GaugeInterface,
  CurvePoolInterface,
  BalancerVaultInterface,
  BalancerPoolInterface,
  CurvePoolAltInterface,
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
import {
  DataServiceVaultAPY,
  RedemptionData,
  RedemptionToken,
  VaultAPY,
} from '@notional-finance/util/src/types';

type RedeemData = {
  lpBalance: BigNumber;
  lpTokenDecimals: number;
  redemptionTokens: RedemptionToken[];
};

const log = debug('vault-apy');

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
      // eslint-disable-next-line no-empty
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
      const currentTimestamp = startingTimestamp - i * ONE_DAY_IN_SECONDS;
      log(`processing day ${i}, ${currentTimestamp}`);
      const initialForkBlock = await this.#getBlockAtTimestamp(
        currentTimestamp
      );

      for (const vault of this.#config.vaults) {
        log(`Processing vault: ${vault.address}`);
        try {
          const adjustedForkBlock = await this.getForkBlock(
            initialForkBlock,
            vault.rewardPoolType,
            vault.address
          );
          await this.run(adjustedForkBlock, vault.address, currentTimestamp);
        } catch (error) {
          log(`Error processing vault ${vault.address}: ${error}`);
        }
      }
    }
  }
  async runHistoricalForVault(
    vaultAddress: string,
    numOfDays: number,
    startingDate: Date = new Date()
  ) {
    const startingTimestamp = startingDate.getTime() / 1000;
    const vaultData = this.#config.vaults.find(
      (v) => v.address.toLowerCase() === vaultAddress.toLowerCase()
    );

    if (!vaultData) {
      throw new Error(`Vault address ${vaultAddress} not found in config`);
    }

    for (let i = 0; i <= numOfDays; i++) {
      const currentTimestamp = startingTimestamp - i * ONE_DAY_IN_SECONDS;
      log(`processing day ${i}`);
      const initialForkBlock = await this.#getBlockAtTimestamp(
        currentTimestamp
      );

      const adjustedForkBlock = await this.getForkBlock(
        initialForkBlock,
        vaultData.rewardPoolType,
        vaultAddress
      );
      await this.run(adjustedForkBlock, vaultAddress, currentTimestamp);
    }
  }

  async runHistoricalForVaultWithBlocks(
    vaultAddress: string,
    blocks: number[]
  ) {
    const vaultData = this.#config.vaults.find(
      (v) => v.address.toLowerCase() === vaultAddress.toLowerCase()
    );

    if (!vaultData) {
      throw new Error(`Vault address ${vaultAddress} not found in config`);
    }

    for (let i = 0; i < blocks.length; i++) {
      const forkBlock = blocks[i];
      log(`processing block ${forkBlock}`);
      const forkBlockTimestamp = (
        await this.#alchemyProvider.getBlock(forkBlock)
      ).timestamp;

      if (vaultData.rewardPoolType === RewardPoolType.Aura) {
        const periodFinish = await this.getPeriodFinishForVault(
          vaultAddress,
          forkBlock
        );
        const timeDifference = periodFinish - forkBlockTimestamp;
        log(
          `Time difference between periodFinish and forkBlock: ${timeDifference} seconds`
        );
      }

      await this.run(forkBlock, vaultAddress, forkBlockTimestamp);
    }
  }

  async run(
    forkBlock: number,
    vaultAddress: string,
    originalTimestamp: number
  ) {
    const vaultData = this.#config.vaults.find(
      (v) => v.address.toLowerCase() === vaultAddress.toLowerCase()
    );

    if (!vaultData) {
      throw new Error(`Vault address ${vaultAddress} not found in config`);
    }

    const { rpcUrl } = await this.#spawnAnvil(forkBlock);

    let provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      this.#config.chainId
    );
    // we can't call getExchangeRate when we warp into future without extending freshness
    await this.#extendMaxOracleFreshness(provider);

    // new provider instance needs to be created otherwise it won't work
    // properly when chain is reverted to checkpoint
    provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      this.#config.chainId
    );

    // we need to create new checkpoint since it is deleted after revert
    const checkpoint = await provider.send('evm_snapshot', []);

    const vault = new Contract(vaultData.address, SingleSidedLPVault, provider);
    // attach additional data
    vaultData.pool = vaultData.pool || (await vault.getStrategyVaultInfo())[0];

    try {
      const results = await this.#calculateFutureAPY(
        provider,
        vaultData as VaultData,
        originalTimestamp,
        forkBlock
      );
      await this.#saveToDb(results);
    } catch (error) {
      log(
        `Error in #calculateFutureAPY for vault ${vaultData.address}: ${error}`
      );
    }

    await provider.send('evm_revert', [checkpoint]);
  }

  async #calculateFutureAPY(
    provider: JsonRpcProvider,
    vaultData: VaultData,
    originalTimestamp: number,
    forkBlock: number
  ) {
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
      ({ account, totalLpTokens } = await this.#findGaugeTokenHolder(
        vaultData,
        provider
      ));
      log(`new account: ${account} for vault ${vaultData.address}`);
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

    const vault = new Contract(vaultData.address, SingleSidedLPVault, provider);
    const priceOfVaultShare = await vault.getExchangeRate(0).catch(() => {
      return BigNumber.from(0);
    });

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

    // Simulate LP token redemption
    const RedeemDataVaultShare = await this.#simulateRedeemLpTokens(
      vaultData,
      provider,
      account
    );

    const redemptionData: RedemptionData = {
      vaultAddress: vaultData.address,
      priceOfVaultShare: priceOfVaultShare.toString(),
      timestamp: floorToMidnight(originalTimestamp),
      redemptionTokens: RedeemDataVaultShare.redemptionTokens, // Add the redemption tokens data
      lpTokenPerVaultShare: RedeemDataVaultShare.lpTokenPerVaultShare,
      lpTokenDecimals: RedeemDataVaultShare.lpTokenDecimals,
    };
    log(redemptionData);

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
      date: new Date(originalTimestamp * 1000).toISOString(),
      ///////////////////////////////////////////////////////////////////////

      swapFees: poolFeesInPrimary.toString(),
      blockNumber: forkBlock,
      timestamp: floorToMidnight(originalTimestamp),
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
    const allResults: VaultAPY[] = [];
    for (const [token, tokensClaimed] of rewardTokens) {
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

      const result: VaultAPY = {
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
      const feeResult: VaultAPY = {
        ...sharedData,
        rewardToken: 'Swap Fees',
        rewardTokenSymbol: 'Swap Fees',
        rewardTokenValuePrimaryBorrow: poolFeesInPrimary.toString(),
      };
      allResults.push(feeResult);
      log(feeResult);
    }

    return {
      vaultAPY: allResults,
      redemptionData,
    };
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
    const tradingModule = new Contract(
      this.#config.addresses.tradingModule,
      TradingModuleInterface,
      provider
    );
    const notional = new Contract(
      await tradingModule.NOTIONAL(),
      NotionalInterface,
      provider
    );
    const notionalOwner = await notional.owner();
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
    let accounts: string[];
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
      accounts = logs.transfers
        .filter(
          (t) =>
            t.from.toLowerCase() !==
            '0x4717C25df44e280ec5b31aCBd8C194e1eD24efe2'.toLowerCase()
        )
        .map((l) => l.from);
    } else {
      logs = await this.#alchemyProvider.send('alchemy_getAssetTransfers', [
        {
          fromAddress: '0x0000000000000000000000000000000000000000',
          contractAddresses: [vaultData.gauge],
          category: ['erc20'],
          order: 'desc',
          toBlock: `0x${latestBlock.toString(16)}`,
          maxCount: `0x${Number(10).toString(16)}`,
        },
      ]);
      accounts = logs.transfers.map((l) => l.to);
    }

    for (const account of accounts) {
      const totalLpTokens = await this.#getTotalLpTokensForAccount(
        account,
        vaultData,
        provider
      );

      if (totalLpTokens.gt(0)) {
        return { account, totalLpTokens };
      }
    }

    throw new Error('Unable to find gauge token holder');
  }

  async #claimRewardFromGauge(
    account: string,
    vaultData: VaultData,
    provider: JsonRpcProvider
  ) {
    const claimData = this.#getClaimData(account, vaultData);
    if (claimData) {
      await provider.send('anvil_impersonateAccount', [account]);
      return provider.send('eth_sendTransaction', [
        { from: account, to: vaultData.gauge, data: claimData },
      ]);
    }
  }

  async #processTransferLogs(
    tx: string | undefined,
    account: string,
    provider: JsonRpcProvider
  ) {
    const rewardTokens: Map<string, BigNumber> = new Map();
    if (tx) {
      const claimLogs = await provider
        .getTransactionReceipt(tx)
        .then((r) => r.logs);
      const transfersToVault = await getTransferLogs(claimLogs).then((r) =>
        r.filter((l) => l.to.toLowerCase() === account.toLowerCase())
      );

      for (const transfer of transfersToVault) {
        const tokensClaimed =
          rewardTokens.get(transfer.token) || BigNumber.from(0);
        rewardTokens.set(transfer.token, tokensClaimed.add(transfer.amount));
      }
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
    if (vaultData.rewardPoolType == RewardPoolType.Balancer) {
      const balancer = new Contract(vaultData.gauge, ERC20Interface, provider);
      return balancer.balanceOf(account);
    }
    throw new Error('Unsupported vault type');
  }

  #getClaimData(account: string, vaultData: VaultData): string | undefined {
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
    if (vaultData.rewardPoolType == RewardPoolType.Balancer) {
      return undefined;
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

  async #saveToDb(reports: DataServiceVaultAPY) {
    if (!reports.vaultAPY.length) {
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
        vaultAPYs: reports.vaultAPY,
        redemptionData: reports.redemptionData,
      }),
    });
    if (!response.ok) {
      console.error(response.status, response.statusText);
      throw new Error('Save to db failed');
    }
  }

  async getPeriodFinishForVault(
    vaultAddress: string,
    forkBlock: number
  ): Promise<number> {
    // Find the vault data in the config
    const vaultData = this.#config.vaults.find(
      (v) => v.address.toLowerCase() === vaultAddress.toLowerCase()
    );

    if (!vaultData) {
      throw new Error(`Vault address ${vaultAddress} not found in config`);
    }

    if (!vaultData.gauge) {
      throw new Error(`Gauge address not specified for vault ${vaultAddress}`);
    }

    const gaugeContract = new Contract(
      vaultData.gauge,
      GaugeInterface,
      this.#alchemyProvider
    );

    try {
      // Call the periodFinish function at the specified block
      const periodFinish: BigNumber = await gaugeContract.periodFinish({
        blockTag: forkBlock,
      });
      log(periodFinish.toString());
      return periodFinish.toNumber();
    } catch (error) {
      console.error(
        `Error fetching periodFinish for gauge ${vaultData.gauge} at block ${forkBlock}:`,
        error
      );
      throw error;
    }
  }

  // Add this helper method to the APYSimulator class
  #getMostRecentThursdayMidnight(timestamp: number): number {
    const date = new Date(timestamp * 1000);
    const day = date.getUTCDay();
    const daysToSubtract = (day + 3) % 7; // Thursday is 4, so we add 3 and take modulo 7
    date.setUTCDate(date.getUTCDate() - daysToSubtract);
    date.setUTCHours(0, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  }

  #getNextThursdayMidnightUTC(timestamp: number): number {
    const date = new Date(timestamp * 1000);
    const daysUntilThursday = (4 - date.getUTCDay() + 7) % 7;
    date.setUTCDate(date.getUTCDate() + daysUntilThursday);
    date.setUTCHours(0, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  }

  async runAll() {
    if (!this.#config.vaults.length) {
      log('Skipping, no vaults specified');
      return;
    }

    const initialForkBlock = await this.#alchemyProvider.getBlockNumber();
    const originalTimestamp = (
      await this.#alchemyProvider.getBlock(initialForkBlock)
    ).timestamp;
    log(`Processing all vaults at block ${initialForkBlock}`);

    for (const vault of this.#config.vaults) {
      log(`Processing vault: ${vault.address}`);
      try {
        const adjustedForkBlock = await this.getForkBlock(
          initialForkBlock,
          vault.rewardPoolType,
          vault.address
        );
        await this.run(adjustedForkBlock, vault.address, originalTimestamp);
      } catch (error) {
        log(`Error processing vault ${vault.address}: ${error}`);
      }
    }
  }

  // Add this function to your APYSimulator class
  private async getForkBlock(
    startingBlock: number,
    rewardPoolType: RewardPoolType,
    vaultAddress: string
  ): Promise<number> {
    let forkBlock = startingBlock;
    const forkBlockTimestamp = (await this.#alchemyProvider.getBlock(forkBlock))
      .timestamp;

    if (
      rewardPoolType === RewardPoolType.Aura ||
      rewardPoolType === RewardPoolType.ConvexMainnet
    ) {
      const periodFinish = await this.getPeriodFinishForVault(
        vaultAddress,
        forkBlock
      );
      const timeDifference = periodFinish - forkBlockTimestamp;
      log(
        `Time difference between periodFinish and forkBlock: ${timeDifference} seconds`
      );

      if (
        timeDifference < -ONE_DAY_IN_SECONDS ||
        timeDifference > ONE_DAY_IN_SECONDS
      ) {
        // Continue as normal
      } else {
        // Find the fork block 1 day behind periodFinish
        forkBlock = await this.#getBlockAtTimestamp(
          periodFinish - ONE_DAY_IN_SECONDS
        );
        log(`Adjusted forkBlock to ${forkBlock} (1 day behind periodFinish)`);
      }
    } else if (rewardPoolType === RewardPoolType.ConvexArbitrum) {
      const mostRecentThursdayMidnight =
        this.#getMostRecentThursdayMidnight(forkBlockTimestamp);
      const nextThursdayMidnight =
        this.#getNextThursdayMidnightUTC(forkBlockTimestamp);
      const oneDayBeforeNextThursday =
        nextThursdayMidnight - ONE_DAY_IN_SECONDS;

      if (forkBlockTimestamp < mostRecentThursdayMidnight + 2 * 60 * 60) {
        // 2 hours ahead
        const adjustedTimestamp =
          mostRecentThursdayMidnight - ONE_DAY_IN_SECONDS;
        forkBlock = await this.#getBlockAtTimestamp(adjustedTimestamp);
        log(
          `Adjusted forkBlock to ${forkBlock} (1 day before most recent Thursday midnight)`
        );
      } else if (forkBlockTimestamp > oneDayBeforeNextThursday) {
        const adjustedTimestamp = oneDayBeforeNextThursday;
        const forkBlock = await this.#getBlockAtTimestamp(adjustedTimestamp);
        log(
          `Adjusted forkBlock to ${forkBlock} (1 day before next Thursday midnight)`
        );
      }
    }

    return forkBlock;
  }

  async #simulateRedeemLpTokens(
    vaultData: VaultData,
    provider: JsonRpcProvider,
    account: string
  ) {
    // Create a checkpoint to revert to after simulation
    const checkpoint = await provider.send('evm_snapshot', []);
    try {
      let redeemData: RedeemData;

      // Get the redemption logic based on rewardPoolType
      if (vaultData.rewardPoolType === RewardPoolType.Aura) {
        try {
          redeemData = await this.#simulateRedeemAuraLpTokens(
            vaultData,
            provider,
            account
          );
        } catch (error) {
          // sometimes the simulation fails because of the oracle issues(OraclePriceExpired error)
          // so we fallback to the calculation method

          await provider.send('evm_revert', [checkpoint]);

          redeemData = await this.#calculateRedeemAuraLpTokens(
            vaultData,
            provider,
            account
          );
        }
      } else if (
        vaultData.rewardPoolType === RewardPoolType.ConvexMainnet ||
        vaultData.rewardPoolType === RewardPoolType.ConvexArbitrum
      ) {
        redeemData = await this.#simulateRedeemConvexLpTokens(
          vaultData,
          provider,
          account
        );
      } else if (vaultData.rewardPoolType === RewardPoolType.Curve) {
        redeemData = await this.#simulateRedeemCurveLpTokens(
          vaultData,
          provider,
          account
        );
      } else {
        throw new Error('Unsupported vault type');
      }

      let lpTokenPerVaultShare = '0';
      if (vaultData.address.toLowerCase() === account.toLowerCase()) {
        const vault = new Contract(
          vaultData.address,
          SingleSidedLPVault,
          provider
        );
        const totalVaultShares = await vault.callStatic
          .getStrategyVaultInfo()
          .then((r) => r.totalVaultShares);

        lpTokenPerVaultShare = redeemData.lpBalance
          .mul(1e8)
          .div(totalVaultShares)
          .toString();
      }

      return {
        lpTokenPerVaultShare,
        lpTokenDecimals: redeemData.lpTokenDecimals,
        redemptionTokens: redeemData.redemptionTokens,
      };
    } catch (error) {
      throw new Error(`Error simulating LP token redemption: ${error}`);
    } finally {
      await provider.send('evm_revert', [checkpoint]);
    }
  }

  async #simulateRedeemAuraLpTokens(
    vaultData: VaultData,
    provider: JsonRpcProvider,
    account: string
  ) {
    try {
      const auraGauge = new Contract(
        vaultData.gauge,
        AuraGaugeInterface,
        provider
      );

      const balancerPool = new Contract(
        vaultData.pool,
        BalancerPoolInterface,
        provider
      );

      const balancerVaultAddress = await balancerPool.getVault();
      const balancerVault = new Contract(
        balancerVaultAddress,
        BalancerVaultInterface,
        provider
      );

      await provider.send('anvil_impersonateAccount', [account]);
      const signer = provider.getSigner(account);

      // First, withdraw LP tokens from the Aura gauge
      await auraGauge.connect(signer).withdrawAllAndUnwrap(false);
      const lpBalance = await balancerPool.balanceOf(account);

      const poolId = await balancerPool.getPoolId();

      await balancerPool
        .connect(signer)
        .approve(balancerVaultAddress, lpBalance);

      const poolTokens = await balancerVault.getPoolTokens(poolId);
      const tokens = poolTokens.tokens;

      // Prepare exit request
      const exitRequest = {
        assets: tokens,
        minAmountsOut: Array(tokens.length).fill(0),
        userData: ethers.utils.defaultAbiCoder.encode(
          ['uint8', 'uint256'],
          [2, lpBalance] // 1 = EXACT_BPT_IN_FOR_TOKENS_OUT
        ),
        toInternalBalance: false,
      };

      const tx = await balancerVault
        .connect(signer)
        .exitPool(poolId, account, account, exitRequest);

      // Process the transfer logs to see what tokens were received
      const receipt = await tx.wait();
      const transferLogs = await getTransferLogs(receipt.logs);
      const transfersToAccount = transferLogs.filter(
        (l) => l.to.toLowerCase() === account.toLowerCase()
      );

      const lpTokenDecimals = await balancerPool.decimals();

      const redemptionTokens: RedemptionToken[] = [];
      // Add each received token to the redemption tokens array
      for (const transfer of transfersToAccount) {
        if (transfer.token.toLowerCase() !== vaultData.pool.toLowerCase()) {
          const { decimals, symbol } = await getTokenDetails(
            transfer.token,
            provider
          );
          redemptionTokens.push({
            symbol,
            address: transfer.token,
            amountPerLpToken: BigNumber.from(transfer.amount)
              .mul(BigNumber.from(10).pow(lpTokenDecimals))
              .div(lpBalance)
              .toString(),
            decimals,
          });
        }
      }

      return {
        lpBalance,
        lpTokenDecimals,
        redemptionTokens,
      };
    } catch (error) {
      throw new Error(`Error simulating Aura LP token redemption: ${error}`);
    }
  }
  async #calculateRedeemAuraLpTokens(
    vaultData: VaultData,
    provider: JsonRpcProvider,
    account: string
  ) {
    try {
      const auraGauge = new Contract(
        vaultData.gauge,
        AuraGaugeInterface,
        provider
      );

      const balancerPool = new Contract(
        vaultData.pool,
        BalancerPoolInterface,
        provider
      );

      await provider.send('anvil_impersonateAccount', [account]);
      const signer = provider.getSigner(account);

      // First, withdraw LP tokens from the Aura gauge
      await auraGauge.connect(signer).withdrawAllAndUnwrap(false);
      const lpBalance = await balancerPool.balanceOf(account);

      // Get token information directly from the pool
      const poolId = await balancerPool.getPoolId();
      const balancerVaultAddress = await balancerPool.getVault();
      const balancerVault = new Contract(
        balancerVaultAddress,
        BalancerVaultInterface,
        provider
      );

      const poolTokens = await balancerVault.getPoolTokens(poolId);
      const tokens = poolTokens.tokens;
      const balances = poolTokens.balances;

      // Calculate proportional amounts based on current pool balances
      const lpTokenDecimals = await balancerPool.decimals();
      const totalSupply = await balancerPool.getActualSupply();

      // Instead of using exitPool which might have oracle issues,
      // calculate redemption values proportionally
      const redemptionTokens: RedemptionToken[] = [];

      for (let i = 0; i < tokens.length; i++) {
        // Skip if token is the LP token itself
        if (tokens[i].toLowerCase() === vaultData.pool.toLowerCase()) continue;

        log('lpBalance', lpBalance);
        // Calculate proportional amount
        const tokenAmount = lpBalance.mul(balances[i]).div(totalSupply);

        log('tokenAmount');
        log(tokenAmount);
        if (tokenAmount.gt(0)) {
          const { decimals, symbol } = await getTokenDetails(
            tokens[i],
            provider
          );

          redemptionTokens.push({
            symbol,
            address: tokens[i],
            amountPerLpToken: tokenAmount
              .mul(BigNumber.from(10).pow(lpTokenDecimals))
              .div(lpBalance)
              .toString(),
            decimals,
          });
        }
      }

      return {
        lpBalance,
        lpTokenDecimals,
        redemptionTokens,
      };
    } catch (error) {
      throw new Error(`Error simulating Aura LP token redemption: ${error}`);
    }
  }

  async #simulateRedeemCurveLpTokens(
    vaultData: VaultData,
    provider: JsonRpcProvider,
    account: string
  ) {
    try {
      const curvePool = new Contract(
        vaultData.pool,
        CurvePoolInterface,
        provider
      );

      const curveGauge = new Contract(
        vaultData.gauge,
        CurveGaugeInterface,
        provider
      );

      await provider.send('anvil_impersonateAccount', [account]);
      const signer = provider.getSigner(account);

      const gaugeBalance = await curveGauge.balanceOf(account);
      await curveGauge.connect(signer).withdraw(gaugeBalance);

      const lpBalance = await curvePool.balanceOf(account);

      const tx = await this.#curveRemoveLiquidity(
        vaultData.pool,
        account,
        lpBalance,
        provider
      );

      // Process the transfer logs to see what tokens were received
      const receipt = await tx.wait();
      const transferLogs = await getTransferLogs(receipt.logs);
      const transfersToAccount = transferLogs.filter(
        (l) => l.to.toLowerCase() === account.toLowerCase()
      );

      const lpTokenDecimals = await curvePool.decimals();

      const redemptionTokens: RedemptionToken[] = [];
      // Add each received token to the redemption tokens array
      for (const transfer of transfersToAccount) {
        if (transfer.token.toLowerCase() !== vaultData.pool.toLowerCase()) {
          const { decimals, symbol } = await getTokenDetails(
            transfer.token,
            provider
          );
          redemptionTokens.push({
            symbol,
            address: transfer.token,
            amountPerLpToken: BigNumber.from(transfer.amount)
              .mul(BigNumber.from(10).pow(lpTokenDecimals))
              .div(lpBalance)
              .toString(),
            decimals,
          });
        }
      }

      return {
        lpBalance,
        lpTokenDecimals,
        redemptionTokens,
      };
    } catch (error) {
      throw new Error(`Error simulating Curve LP token redemption: ${error}`);
    }
  }

  async #getCurvePoolNumCoins(curvePool: Contract): Promise<number> {
    try {
      // First try the n_coins view function (most common in Curve pools)
      return (await curvePool.N_COINS()).toNumber();
    } catch (error) {
      try {
        // Some pools use coin_count instead
        return (await curvePool.coin_count()).toNumber();
      } catch (error) {
        // If both fail, default to 2 coins which is common for many Curve pools
        log(
          'Could not determine number of coins in Curve pool, defaulting to 2'
        );
        return 2;
      }
    }
  }

  async #curveRemoveLiquidity(
    curvePoolAddress: string,
    account: string,
    lpBalance: BigNumber,
    provider: JsonRpcProvider
  ) {
    const curvePool = new Contract(
      curvePoolAddress,
      CurvePoolInterface,
      provider
    );

    const numCoins = await this.#getCurvePoolNumCoins(curvePool);
    const minAmounts = Array(numCoins).fill(0);
    const signer = provider.getSigner(account);

    let tx: ContractTransaction;
    try {
      tx = await curvePool
        .connect(signer)
        .remove_liquidity(lpBalance, minAmounts);
    } catch {
      const curvePoolAlt = new Contract(
        curvePoolAddress,
        CurvePoolAltInterface,
        provider
      );

      tx = await curvePoolAlt
        .connect(signer)
        .remove_liquidity(lpBalance, minAmounts);
    }
    return tx;
  }

  async #simulateRedeemConvexLpTokens(
    vaultData: VaultData,
    provider: JsonRpcProvider,
    account: string
  ) {
    try {
      const ConvexGaugeInterface =
        vaultData.rewardPoolType === RewardPoolType.ConvexMainnet
          ? ConvexGaugeMainnetInterface
          : ConvexGaugeArbitrumInterface;

      // Get the Convex gauge contract
      const convexGauge = new Contract(
        vaultData.gauge,
        ConvexGaugeInterface,
        provider
      );

      // Get the Curve pool contract
      const curvePool = new Contract(
        vaultData.pool,
        CurvePoolInterface,
        provider
      );

      // Impersonate the account
      await provider.send('anvil_impersonateAccount', [account]);
      const signer = provider.getSigner(account);

      const convexGaugeBalance = await convexGauge.balanceOf(account);
      if (vaultData.rewardPoolType === RewardPoolType.ConvexMainnet) {
        await convexGauge
          .connect(signer)
          .withdrawAndUnwrap(convexGaugeBalance.toString(), true);
      } else {
        await convexGauge.connect(signer).withdrawAll(false);
      }

      const lpBalance = await curvePool.balanceOf(account);

      // Simulate the redemption
      const tx = await this.#curveRemoveLiquidity(
        vaultData.pool,
        account,
        lpBalance,
        provider
      );

      // Process the transfer logs to see what tokens were received
      const receipt = await tx.wait();
      const transferLogs = await getTransferLogs(receipt.logs);
      const transfersToAccount = transferLogs.filter(
        (l) => l.to.toLowerCase() === account.toLowerCase()
      );

      const lpTokenDecimals = await curvePool.decimals();

      const redemptionTokens: RedemptionToken[] = [];
      // Add each received token to the redemption tokens array
      for (const transfer of transfersToAccount) {
        if (transfer.token.toLowerCase() !== vaultData.pool.toLowerCase()) {
          const { decimals, symbol } = await getTokenDetails(
            transfer.token,
            provider
          );
          redemptionTokens.push({
            symbol,
            address: transfer.token,
            amountPerLpToken: BigNumber.from(transfer.amount)
              .mul(BigNumber.from(10).pow(lpTokenDecimals))
              .div(lpBalance)
              .toString(),
            decimals,
          });
        }
      }

      return {
        lpBalance,
        lpTokenDecimals,
        redemptionTokens,
      };
    } catch (error) {
      throw new Error(`Error simulating Convex LP token redemption: ${error}`);
    }
  }
}
