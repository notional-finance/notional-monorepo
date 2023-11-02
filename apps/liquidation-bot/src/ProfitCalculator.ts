import { BigNumber, Contract } from 'ethers';
import {
  AccountLiquidation,
  CurrencyOverride,
  DexId,
  FlashLiquidation,
  IFlashLoanProvider,
  IGasOracle,
  LiquidationType,
  TradeData,
  TradeType,
} from './types';
import { getNowSeconds } from '@notional-finance/util';
import { FlashLiquidator__factory } from '@notional-finance/contracts';

export type ProfitCalculatorSettings = {
  liquidatorContract: Contract;
  zeroExUrl: string;
  zeroExApiKey: string;
  overrides: CurrencyOverride[];
  liquidatorOwner: string;
  exactInSlippageLimit: BigNumber; // Precision = 1000
  exactOutSlippageLimit: BigNumber; // Precision = 1000
  gasCostBuffer: BigNumber; // Precision = 1000
  profitThreshold: BigNumber; // in ETH
};

export default class ProfitCalculator {
  constructor(
    public gasOracle: IGasOracle,
    public flashLender: IFlashLoanProvider,
    public settings: ProfitCalculatorSettings
  ) {}

  private async getZeroExData(
    zeroExUrl: string,
    from: string,
    to: string,
    amount: BigNumber,
    exactIn: boolean
  ): Promise<any> {
    if (!from || !to) {
      throw Error('Invalid from/to');
    }

    const queryParams = new URLSearchParams({
      sellToken: from,
      buyToken: to,
    });

    if (exactIn) {
      queryParams.set('sellAmount', amount.toString());
    } else {
      queryParams.set('buyAmount', amount.toString());
    }

    const fetchUrl = zeroExUrl + '?' + queryParams;
    const resp = await fetch(fetchUrl, {
      headers: {
        '0x-api-key': this.settings.zeroExApiKey,
      },
    });
    if (resp.status !== 200) {
      throw Error('Bad 0x response');
    }

    const data = await resp.json();

    return data;
  }

  public async getFlashLiquidation(
    accountLiq: AccountLiquidation
  ): Promise<FlashLiquidation> {
    const hasCollateral =
      accountLiq.liquidation.getLiquidationType() ===
        LiquidationType.COLLATERAL_CURRENCY ||
      accountLiq.liquidation.getLiquidationType() ===
        LiquidationType.CROSS_CURRENCY_FCASH;

    let flashBorrowAsset = accountLiq.liquidation.getLocalUnderlyingAddress();
    const borrowAssetOverride = this.settings.overrides.find(
      (c) => c.id === accountLiq.liquidation.getLocalCurrency().id
    );
    if (borrowAssetOverride) {
      flashBorrowAsset = borrowAssetOverride.flashBorrowAsset;
    }

    let preLiquidationTrade: TradeData = null;
    if (
      flashBorrowAsset !== accountLiq.liquidation.getLocalUnderlyingAddress()
    ) {
      // Sell flash borrowed asset for local currency
      const zeroExResp = await this.getZeroExData(
        this.settings.zeroExUrl,
        flashBorrowAsset,
        accountLiq.liquidation.getLocalUnderlyingAddress(),
        accountLiq.flashLoanAmount,
        true
      );
      preLiquidationTrade = {
        trade: {
          tradeType: TradeType.EXACT_IN_SINGLE,
          sellToken: flashBorrowAsset,
          buyToken: accountLiq.liquidation.getLocalUnderlyingAddress(),
          amount: accountLiq.flashLoanAmount,
          limit: BigNumber.from(zeroExResp.buyAmount)
            .mul(this.settings.exactInSlippageLimit)
            .div(1000),
          deadline: BigNumber.from(getNowSeconds()),
          exchangeData: zeroExResp.data,
        },
        dexId: DexId.ZERO_EX,
        useDynamicSlippage: false,
        dynamicSlippageLimit: BigNumber.from(0),
      };
    }

    let collateralTrade: TradeData = null;
    if (hasCollateral) {
      const zeroExResp = await this.getZeroExData(
        this.settings.zeroExUrl,
        accountLiq.liquidation.getCollateralUnderlyingAddress(),
        flashBorrowAsset,
        accountLiq.flashLoanAmount,
        false
      );

      collateralTrade = {
        trade: {
          tradeType: TradeType.EXACT_OUT_SINGLE,
          sellToken: accountLiq.liquidation.getCollateralUnderlyingAddress(),
          buyToken: flashBorrowAsset,
          amount: accountLiq.flashLoanAmount,
          limit: BigNumber.from(zeroExResp.sellAmount)
            .mul(this.settings.exactOutSlippageLimit)
            .div(1000),
          deadline: BigNumber.from(getNowSeconds()),
          exchangeData: zeroExResp.data,
        },
        dexId: DexId.ZERO_EX,
        useDynamicSlippage: false,
        dynamicSlippageLimit: BigNumber.from(0),
      };
    }

    return {
      accountLiq: accountLiq,
      flashBorrowAsset: flashBorrowAsset,
      preLiquidationTrade: preLiquidationTrade,
      collateralTrade: collateralTrade,
    };
  }

  public async getTotalProfit(flashLiq: FlashLiquidation): Promise<BigNumber> {
    const liquidator = FlashLiquidator__factory.connect(
      this.settings.liquidatorContract.address,
      this.settings.liquidatorContract.provider
    );

    let totalProfit = BigNumber.from(0);
    let flashAssetProfit = BigNumber.from(0);
    let collateralProfit = BigNumber.from(0);
    try {
      const results = await liquidator.callStatic.flashLoan(
        flashLiq.flashBorrowAsset,
        flashLiq.accountLiq.flashLoanAmount,
        flashLiq.accountLiq.liquidation.encode(
          flashLiq.accountLiq.accountId,
          false,
          flashLiq.preLiquidationTrade,
          flashLiq.collateralTrade
        ),
        flashLiq.accountLiq.liquidation.getLocalUnderlyingAddress(),
        flashLiq.accountLiq.liquidation.getCollateralUnderlyingAddress(),
        {
          from: this.settings.liquidatorOwner,
        }
      );

      flashAssetProfit = results[0];
      totalProfit = results[1];
      collateralProfit = results[2];
    } catch (e) {
      const txn = await liquidator.populateTransaction['flashLoan'](
        flashLiq.flashBorrowAsset,
        flashLiq.accountLiq.flashLoanAmount,
        flashLiq.accountLiq.liquidation.encode(
          flashLiq.accountLiq.accountId,
          false,
          flashLiq.preLiquidationTrade,
          flashLiq.collateralTrade
        ),
        flashLiq.accountLiq.liquidation.getLocalUnderlyingAddress(),
        flashLiq.accountLiq.liquidation.getCollateralUnderlyingAddress(),
        {
          from: this.settings.liquidatorOwner,
        }
      );
      console.error(flashLiq.flashBorrowAsset);
      console.error(flashLiq.accountLiq.flashLoanAmount.toString());
      console.error('Populated Txn', JSON.stringify(txn));
      console.error(e);
    }

    if (
      flashLiq.accountLiq.liquidation.getCollateralCurrencyId() !== 0 &&
      collateralProfit.gt(0)
    ) {
      // FX collateral profit to local profit
      totalProfit = totalProfit.add(
        BigNumber.from(
          (
            await this.getZeroExData(
              this.settings.zeroExUrl,
              flashLiq.accountLiq.liquidation.getCollateralUnderlyingAddress(),
              flashLiq.accountLiq.liquidation.getLocalUnderlyingAddress(),
              collateralProfit,
              true
            )
          ).buyAmount
        )
      );
    }

    if (
      flashLiq.flashBorrowAsset !==
      flashLiq.accountLiq.liquidation.getLocalUnderlyingAddress()
    ) {
      if (flashAssetProfit.gt(0)) {
        // FX profit denominated to flash loan currency to local currency
        totalProfit = totalProfit.add(
          BigNumber.from(
            (
              await this.getZeroExData(
                this.settings.zeroExUrl,
                flashLiq.flashBorrowAsset,
                flashLiq.accountLiq.liquidation.getLocalUnderlyingAddress(),
                flashAssetProfit,
                true
              )
            ).buyAmount
          )
        );
      }
    }

    return totalProfit;
  }

  public async sortByProfitability(
    liquidations: AccountLiquidation[]
  ): Promise<FlashLiquidation[]> {
    const profits = [];

    for (let i = 0; i < liquidations.length; i++) {
      try {
        const liq = liquidations[i];

        const flashLiq = await this.getFlashLiquidation(liq);
        const totalProfit = await this.getTotalProfit(flashLiq);

        if (totalProfit.isZero()) {
          continue;
        }

        const gasAmount = await this.flashLender.estimateGas(flashLiq);
        const gasPrice = await this.gasOracle.getGasPrice();
        const gasCost = gasAmount
          .mul(gasPrice)
          .mul(this.settings.gasCostBuffer)
          .div(1000);
        const netProfit = totalProfit.sub(gasCost);

        if (netProfit.gt(this.settings.profitThreshold)) {
          profits.push({
            liquidation: flashLiq,
            estimatedProfit: netProfit,
          });
        }
        // Need to sleep a bit between 0x calls
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.error(e);
      }
    }

    return profits
      .sort((a, b) => a.estimatedProfit.lt(b.estimatedProfit))
      .map((p) => p.liquidation);
  }
}
