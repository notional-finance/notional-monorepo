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
import { Env, TradeType, DexId } from "./types";

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
    return fetch('https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2', {
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

  public async run() {
    const lastNoteInvestmentTimestamp = await this.getLastNoteInvestmentTime();
    console.log("lastNoteInvestmentTimestamp", lastNoteInvestmentTimestamp);
    const duration = Date.now() / 1000 - lastNoteInvestmentTimestamp;
    if (duration > Config.TREASURY_REINVESTMENT_INTERVAL) {
      const wethToken = ERC20__factory.connect(this.WETH, this.provider);
      const wethBalance = await wethToken.balanceOf(this.proxy.address);

      if (wethBalance.gt(0)) {
        console.log("WETH balance detected, calling investWETHAndNOTE");
        const noteBurnPercent = await this.proxy.noteBurnPercent();
        const wethForBurn = wethBalance.mul(noteBurnPercent).div(100);

        const zeroXData = await get0xData({
          sellToken: this.WETH,
          buyToken: this.NOTE,
          sellAmount: wethForBurn,
          env: this.env
        });

        const trade: Trade = {
          tradeType: TradeType.EXACT_IN_SINGLE,
          buyToken: this.NOTE,
          sellToken: this.WETH,
          amount: wethForBurn,
          limit: zeroXData.limit,
          deadline: nowInSec() + TWO_HOURS_SEC,
          exchangeData: zeroXData.data
        };

        const { receivedBPT } = await this.proxy.callStatic.investWETHAndNOTE(
          wethBalance,
          BigNumber.from(0),
          0,
          trade
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
      } else {
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
