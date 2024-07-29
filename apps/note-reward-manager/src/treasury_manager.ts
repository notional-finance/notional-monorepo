import { Provider } from "@ethersproject/abstract-provider";
import { get0xData, sendTxThroughRelayer } from "@notional-finance/util";
import {
  TreasuryManager as TreasuryManagerProxy,
  TreasuryManager__factory,
  ERC20__factory
} from "@notional-finance/contracts";
import { TradeStruct as Trade } from "@notional-finance/contracts/types/TradingModule";
import Config from "./config";
import { BigNumber } from "ethers";
import { Env, TradeType, DexId, RunType } from "./types";

const TWO_HOURS_SEC = 1200;
const nowInSec = () => Math.floor(Date.now() / 1000);

export default class TreasuryManager {
  private proxy: TreasuryManagerProxy;
  private COMP: string;
  private WETH: string;
  private NOTE: string;

  constructor(
    private network: string,
    private provider: Provider,
    private env: Env
  ) {
    this.proxy = TreasuryManager__factory.connect(Config.getTreasuryAddress(this.network), this.provider);
    this.COMP = Config.getTokenAddress(this.network, "COMP");
    this.WETH = Config.getTokenAddress(this.network, "WETH");
    this.NOTE = Config.getTokenAddress(this.network, "NOTE");
  }

  public async getLastNoteInvestmentTime(): Promise<number> {
    return fetch(`https://gateway-arbitrum.network.thegraph.com/api/${this.env.SUBGRAPH_API_KEY}/subgraphs/id/BnVrrrzw6cLHxFUkgtfmWcF83DopC8jrYnrMnysVKptm`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        query: `{
        stakedNoteInvestments(first: 1, orderBy:timestamp, orderDirection:desc) {
          timestamp
        }
      }`
      })
    }).then(r => r.json())
      .then((r: any) => r.data.stakedNoteInvestments[0]?.timestamp || 0);
  }

  public async run(runType: RunType) {
    const lastNoteInvestmentTimestamp = await this.getLastNoteInvestmentTime();
    console.log("lastNoteInvestmentTimestamp", lastNoteInvestmentTimestamp);
    const lastInvestmentStartOfDay = new Date(lastNoteInvestmentTimestamp * 1000);
    lastInvestmentStartOfDay.setUTCHours(0, 0, 0, 0);
    const duration = (Date.now() - lastInvestmentStartOfDay.getTime()) / 1000;
    if (
      // force run it twice (sellComp & burnNote) at Saturday midnight and after that respect TREASURY_REINVESTMENT_INTERVAL
      (
        new Date('2024-06-09T00:00:00.000Z').getTime() <= Date.now() &&
        Date.now() < new Date('2024-06-09T00:15:00.000Z').getTime()
      ) || duration > Config.TREASURY_REINVESTMENT_INTERVAL
    ) {
      if (runType === RunType.burnNOTE) {
        const wethToken = ERC20__factory.connect(this.WETH, this.provider);
        const wethBalance = await wethToken.balanceOf(this.proxy.address);
        if (!wethBalance.gte(1e15)) {
          console.log("No WETH available");
          return;
        }
        console.log("WETH balance detected, calling investWETHAndNOTE");

        const noteBurnPercent = await this.proxy.noteBurnPercent();
        const wethForBurn = wethBalance.mul(noteBurnPercent).div(100);

        // empty trade
        const trade: Trade = {
          tradeType: TradeType.EXACT_IN_SINGLE,
          buyToken: this.NOTE,
          sellToken: this.WETH,
          amount: BigNumber.from(0),
          limit: BigNumber.from(0),
          deadline: nowInSec() + TWO_HOURS_SEC,
          exchangeData: '0x'
        };

        if (wethForBurn.gt(0)) {
          const zeroXData = await get0xData({
            sellToken: this.WETH,
            buyToken: this.NOTE,
            sellAmount: wethForBurn,
            taker: this.proxy.address,
            env: this.env
          });

          trade.amount = wethForBurn;
          trade.limit = zeroXData.limit;
          trade.exchangeData = zeroXData.data;
        }

        const { receivedBPT } = await this.proxy.callStatic.investWETHAndNOTE(
          wethBalance,
          BigNumber.from(0),
          0,
          trade,
          { from: this.env.MANAGER_BOT_ADDRESS }
        );
        const minBPT = receivedBPT.mul((1 - 0.005) * 1000).div(1000);
        const data = this.proxy.interface.encodeFunctionData(
          'investWETHAndNOTE',
          [wethBalance, BigNumber.from(0), minBPT, trade]
        );

        return sendTxThroughRelayer({
          to: this.proxy.address,
          data: data,
          env: this.env
        });
      } else if (runType == RunType.sellCOMP) {
        console.log('Selling COMP...');
        const compToken = ERC20__factory.connect(this.COMP, this.provider);
        const compBal = await compToken.balanceOf(this.proxy.address);
        if (compBal.gt(0)) {
          let sellAmount = BigNumber.from(Config.TREASURY_SELL_AMOUNT);
          if (sellAmount.gt(compBal)) {
            sellAmount = compBal;
          }

          const zeroXdata = await get0xData({
            sellToken: this.COMP,
            buyToken: this.WETH,
            sellAmount,
            taker: this.proxy.address,
            env: this.env
          });
          console.log(`
            sellAmount = ${sellAmount.toString()}
            limit = ${zeroXdata.limit.toString()}
          `);

          const trade: Trade = {
            tradeType: TradeType.EXACT_IN_SINGLE,
            sellToken: this.COMP,
            buyToken: this.WETH,
            amount: sellAmount,
            limit: zeroXdata.limit,
            deadline: nowInSec() + TWO_HOURS_SEC,
            exchangeData: zeroXdata.data
          };

          // check will trade execute successfully
          await this.proxy.callStatic.executeTrade(
            trade,
            DexId.ZERO_EX,
            { from: this.env.MANAGER_BOT_ADDRESS }
          );

          const data = this.proxy.interface.encodeFunctionData(
            'executeTrade',
            [trade, DexId.ZERO_EX]
          );

          return sendTxThroughRelayer({
            to: this.proxy.address,
            data: data,
            env: this.env
          });
        } else {
          console.log("No COMP");
        }
      }
    } else {
      console.log(`duration(${duration}) is less than interval(${Config.TREASURY_REINVESTMENT_INTERVAL})`);
    }
  }
}
