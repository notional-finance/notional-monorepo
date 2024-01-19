import { Provider } from "@ethersproject/abstract-provider";
import {
  MetaStable2TokenAuraVault,
  MetaStable2TokenAuraVault__factory,
  AuraRewardPool__factory,
  ERC20__factory
} from "@notional-finance/contracts";
import { BigNumber, utils, constants } from "ethers";
import { TradeType, DexId } from "./config";
import DDClient from "./dd_client";
import Config from "./config";
import Notifier from "./notifier";
import { Env } from "./types";
import { get0xData, sendTxThroughRelayer } from "./util";

export default class VaultManager {
  private static readonly TRADE_PARAMS = "tuple(uint16,uint8,uint256,bool,bytes)"
  private static readonly SINGLE_SIDED_TRADE_PARAMS = `tuple(address,address,uint256,${this.TRADE_PARAMS})`;
  private static readonly VAULT_TRADE_PARAMS = `tuple(${this.SINGLE_SIDED_TRADE_PARAMS},${this.SINGLE_SIDED_TRADE_PARAMS})`;
  private static readonly ONE = BigNumber.from("1000000000000000000");

  private proxy: MetaStable2TokenAuraVault;
  private notifier: Notifier;
  private USDC: string;
  private WETH: string;
  private wstETH: string;
  private AURA: string;
  private BAL: string;

  constructor(
    private network: string,
    private provider: Provider,
    ddClient: DDClient,
    private env: Env
  ) {
    this.proxy = MetaStable2TokenAuraVault__factory.connect(Config.getWstETHVaultAddress(this.network), this.provider);
    this.USDC = Config.getTokenAddress(this.network, "USDC");
    this.WETH = Config.getTokenAddress(this.network, "WETH");
    this.wstETH = Config.getTokenAddress(this.network, "wstETH");
    this.AURA = Config.getTokenAddress(this.network, "AURA");
    this.BAL = Config.getTokenAddress(this.network, "BAL");
    this.notifier = new Notifier(network, ddClient);
  }

  private async getAuraEarned(balEarned: BigNumber) {
    const auraToken = ERC20__factory.connect(this.AURA, this.provider);
    const emissionsMinted = (await auraToken.totalSupply()).sub("50000000000000000000000000"); // 5e25
    const cliff = emissionsMinted.div("100000000000000000000000"); // 1e23
    const totalCliffs = BigNumber.from(500);

    if (cliff.lt(totalCliffs)) {
      const reduction = totalCliffs.sub(cliff).mul(5).div(2).add(700);
      return balEarned.mul(reduction).div(totalCliffs);
    }

    return BigNumber.from(0);
  }

  public async claimRewards(stakingContext: any) {
    const auraAddress = stakingContext.auraRewardPool;
    const aura = AuraRewardPool__factory.connect(auraAddress, this.provider);
    const balEarned = await aura.earned(this.proxy.address);
    const { buyAmount: balUSDEarned } = await get0xData({
      sellToken: stakingContext.rewardTokens[0],
      buyToken: this.USDC,
      sellAmount: balEarned,
      env: this.env
    });

    const auraEarned = await this.getAuraEarned(balEarned);
    const { buyAmount: auraUSDEarned } = await get0xData({
      sellToken: stakingContext.rewardTokens[1],
      buyToken: this.USDC,
      sellAmount: auraEarned,
      env: this.env
    });
    const balThreshold = Config.getReinvestmentThreshold(this.network, this.BAL);
    const auraThreshold = Config.getReinvestmentThreshold(this.network, this.AURA);

    const logMsg = `
    BAL Earned=${utils.formatUnits(balEarned, 18)}
    BAL USD Value=${utils.formatUnits(balUSDEarned, 6)}
    AURA Earned=${utils.formatUnits(auraEarned, 18)}
    AURA USD Value=${utils.formatUnits(auraUSDEarned, 6)}
    BAL Threshold=${utils.formatUnits(balThreshold, 6)}
    AURA Threshold=${utils.formatUnits(auraThreshold, 6)}
    `;

    console.log(logMsg);

    if (balUSDEarned.gt(balThreshold) || auraUSDEarned.gt(auraThreshold)) {
      await sendTxThroughRelayer({
        to: this.proxy.address,
        env: this.env,
        data: this.proxy.interface.encodeFunctionData(
          'claimRewardTokens',
        )
      });

      this.notifier.notifyMessage({
        key: null,
        type: "info",
        text: logMsg,
        title: "Claimed reward tokens",
        tags: [`network:${this.network}`, `event:claim_rewards`],
      });
    }
  }

  private getBalancerSingleData(poolId: string) {
    const coder = new utils.AbiCoder;
    return coder.encode(["tuple(bytes32)"], [[poolId]]);
  }

  private getBalancerBatchData(swaps: any[], assets: string[], limits: BigNumber[]) {
    const coder = new utils.AbiCoder;
    return coder.encode(
      ['tuple(tuple(bytes32,uint256,uint256,uint256,bytes)[],address[],int256[])'],
      [[swaps, assets, limits]]
    )
  }

  private getPrimaryRatio(poolContext: any) {
    const primaryBalance = poolContext.primaryBalance
    const secondaryBalance = poolContext.secondaryBalance
    return primaryBalance.mul(VaultManager.ONE).div(primaryBalance.add(secondaryBalance));
  }

  private async reinvestReward(poolContext: any, rewardToken: string, amount: BigNumber) {
    const primaryRatio = this.getPrimaryRatio(poolContext);
    const primaryAmount = amount.mul(primaryRatio).div(VaultManager.ONE);
    const secondaryAmount = amount.sub(primaryAmount);
    const primaryLimit = await get0xData({
      sellToken: rewardToken,
      buyToken: this.WETH,
      sellAmount: primaryAmount,
      env: this.env
    }).then(d => d.buyAmount.mul(55).div(100));
    const secondaryLimit = await get0xData({
      sellToken: rewardToken,
      buyToken: this.wstETH,
      sellAmount: secondaryAmount,
      env: this.env
    }).then(d => d.buyAmount.mul(55).div(100));

    const logMsg = `
      rewardToken=${rewardToken}
      primaryRatio=${utils.formatUnits(primaryRatio, 18)}
      primaryAmount=${primaryAmount.toString()}
      secondaryAmount=${secondaryAmount.toString()}
      primaryLimit=${primaryLimit.toString()}
      secondaryLimit=${secondaryLimit.toString()}
    `;

    console.log(logMsg);

    const coder = new utils.AbiCoder;
    const primaryTrade = [
      rewardToken,
      constants.AddressZero,
      primaryAmount,
      [
        DexId.BALANCER_V2,
        TradeType.EXACT_IN_SINGLE,
        primaryLimit,
        false,
        this.getBalancerSingleData(Config.getRewardTokenPoolId(this.network, rewardToken))
      ]
    ];

    const secondaryTrade = [
      rewardToken,
      this.wstETH,
      secondaryAmount,
      [
        DexId.BALANCER_V2,
        TradeType.EXACT_IN_BATCH,
        secondaryLimit,
        false,
        this.getBalancerBatchData(
          [
            // RewardToken -> ETH
            [Config.getRewardTokenPoolId(this.network, rewardToken), 0, 1, secondaryAmount, []],
            // ETH -> wstETH
            // 0 = Entire amount from previous swap
            [Config.getRewardTokenPoolId(this.network, this.wstETH), 1, 2, 0, []]
          ],
          [rewardToken, this.WETH, this.wstETH],
          [secondaryAmount, BigNumber.from(0), secondaryLimit.mul(-1)]
        )
      ]
    ];

    const tradeData = coder.encode(
      [VaultManager.VAULT_TRADE_PARAMS],
      [[primaryTrade, secondaryTrade]]
    );

    await sendTxThroughRelayer({
      to: this.proxy.address,
      env: this.env,
      data: this.proxy.interface.encodeFunctionData(
        'reinvestReward',
        [{ tradeData, minBPT: BigNumber.from(0) }]
      )
    });


    this.notifier.notifyMessage({
      key: null,
      type: "info",
      text: logMsg,
      title: "Reward token reinvested",
      tags: [`network:${this.network}`, `event:claim_rewards`],
    });

    console.log(`${rewardToken} reinvestment success!`);
  }

  public async reinvestRewards(poolContext: any, rewardTokens: string[]) {
    const tokenBalances = await Promise.all(rewardTokens.map((rt) => {
      return ERC20__factory.connect(rt, this.provider).balanceOf(this.proxy.address);
    }));

    for (let i = 0; i < rewardTokens.length; i++) {
      const balanceUSDC = await get0xData({
        sellToken: rewardTokens[i],
        buyToken: this.USDC,
        sellAmount: tokenBalances[i],
        env: this.env
      }).then(d => d.buyAmount);
      await new Promise(f => setTimeout(f, 4000));

      const threshold = Config.getReinvestmentThreshold(this.network, rewardTokens[i]);
      if (balanceUSDC.gt(threshold.mul(90).div(100))) {
        await this.reinvestReward(poolContext, rewardTokens[i], tokenBalances[i]);
      }
    }
  }

  public async run() {
    const strategyContext = await this.proxy.getStrategyContext();
    //await this.claimRewards(strategyContext.stakingContext);
    await this.reinvestRewards(strategyContext.poolContext, strategyContext.stakingContext.rewardTokens);

    await this.notifier.flush();
  }
}
