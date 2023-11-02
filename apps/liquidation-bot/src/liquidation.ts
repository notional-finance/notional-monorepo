import { LiquidationType, TradeData, Currency } from './types';
import { utils, constants, Contract } from 'ethers';

export default class Liquidation {
  public static readonly ETH_CURRENCY_ID = 1;
  public static readonly LOCAL_CURRENCY_PARAMS = 'tuple(address,uint16,uint96)';
  public static readonly TRADE_PARAMS =
    'tuple(uint8,address,address,uint256,uint256,uint256,bytes)';
  public static readonly TRADE_DATA_PARAMS = `tuple(${Liquidation.TRADE_PARAMS},uint16,bool,uint32)`;
  public static readonly COLLATERAL_CURRENCY_PARAMS = `tuple(address,uint16,uint16,address,uint128,uint96,${Liquidation.TRADE_DATA_PARAMS})`;
  public static readonly LOCAL_FCASH_PARAMS =
    'tuple(address,uint16,uint256[],uint256[])';
  public static readonly CROSS_CURRENCY_FCASH_PARAMS = `tuple(address,uint16,uint16,address,uint256[],uint256[],${Liquidation.TRADE_DATA_PARAMS})`;

  private type: LiquidationType;
  private hasTransferFee: boolean;
  private localCurrency: Currency;
  private localUnderlyingAddress: string;
  private collateralCurrencyId: number;
  private collateralUnderlyingAddress: string;
  private collateralUnderlyingSymbol: string;
  private maturities: number[];
  private residuals: boolean;

  constructor(
    type: LiquidationType,
    localCurrency: Currency,
    collateralCurrency: Currency | null,
    maturities: number[] | null,
    wethAddress: string
  ) {
    this.type = type;
    this.hasTransferFee = localCurrency.hasTransferFee;
    this.localCurrency = localCurrency;

    if (localCurrency.id === Liquidation.ETH_CURRENCY_ID) {
      this.localUnderlyingAddress = wethAddress;
    } else {
      if (localCurrency.underlyingContract) {
        this.localUnderlyingAddress = localCurrency.underlyingContract.address;
      } else {
        throw Error('Missing local currency');
      }
    }

    if (collateralCurrency) {
      this.collateralCurrencyId = collateralCurrency.id;

      if (collateralCurrency.id === Liquidation.ETH_CURRENCY_ID) {
        this.collateralUnderlyingAddress = wethAddress;
        this.collateralUnderlyingSymbol = 'WETH';
      } else {
        if (collateralCurrency.underlyingContract?.address) {
          this.collateralUnderlyingAddress =
            collateralCurrency.underlyingContract?.address;
          this.collateralUnderlyingSymbol =
            collateralCurrency.underlyingSymbol as string;
        } else {
          this.collateralUnderlyingAddress = constants.AddressZero;
          this.collateralUnderlyingSymbol = '';
        }
      }
    } else {
      this.collateralCurrencyId = 0;
      this.collateralUnderlyingAddress = constants.AddressZero;
      this.collateralUnderlyingSymbol = '';
    }

    this.maturities = maturities ? maturities.sort((a, b) => b - a) : [];
    this.residuals = false;
  }

  public getLiquidationType(): LiquidationType {
    return this.type;
  }

  public getLocalCurrency(): Currency {
    return this.localCurrency;
  }

  public getLocalUnderlyingAddress(): string {
    return this.localUnderlyingAddress;
  }

  public getCollateralCurrencyId(): number {
    return this.collateralCurrencyId;
  }

  public getCollateralUnderlyingSymbol(): string {
    return this.collateralUnderlyingSymbol;
  }

  public getCollateralUnderlyingAddress(): string {
    return this.collateralUnderlyingAddress;
  }

  public hasResiduals(): boolean {
    return this.residuals;
  }

  private getTradeDataParams(tradeData: TradeData) {
    return [
      [
        tradeData.trade.tradeType,
        tradeData.trade.sellToken,
        tradeData.trade.buyToken,
        tradeData.trade.amount,
        tradeData.trade.limit,
        tradeData.trade.deadline,
        tradeData.trade.exchangeData,
      ],
      tradeData.dexId,
      tradeData.useDynamicSlippage,
      tradeData.dynamicSlippageLimit,
    ];
  }

  private encodeTradeData(tradeData: TradeData) {
    const coder = new utils.AbiCoder();
    return coder.encode(
      [Liquidation.TRADE_DATA_PARAMS],
      [this.getTradeDataParams(tradeData)]
    );
  }

  public encode(
    account: string,
    withdraw: boolean,
    preLiquidationTrade: TradeData | null,
    collateralTrade: TradeData | null
  ): string {
    let liqCalldata = '';
    const coder = new utils.AbiCoder();

    switch (this.type) {
      case LiquidationType.LOCAL_CURRENCY:
        {
          liqCalldata = coder.encode(
            [Liquidation.LOCAL_CURRENCY_PARAMS],
            [[account, this.localCurrency.id.toString(), '0']]
          );
        }
        break;
      case LiquidationType.COLLATERAL_CURRENCY:
        {
          if (!collateralTrade) {
            throw Error('Collateral trade expected');
          }
          liqCalldata = coder.encode(
            [Liquidation.COLLATERAL_CURRENCY_PARAMS],
            [
              [
                account,
                this.localCurrency.id.toString(),
                this.collateralCurrencyId?.toString(),
                this.collateralUnderlyingAddress,
                '0',
                '0',
                this.getTradeDataParams(collateralTrade),
              ],
            ]
          );
        }
        break;
      case LiquidationType.LOCAL_FCASH:
        {
          liqCalldata = coder.encode(
            [Liquidation.LOCAL_FCASH_PARAMS],
            [
              [
                account,
                this.localCurrency.id.toString(),
                this.maturities,
                this.maturities.map(() => 0),
              ],
            ]
          );
        }
        break;
      case LiquidationType.CROSS_CURRENCY_FCASH:
        {
          if (!collateralTrade) {
            throw Error('Collateral trade expected');
          }
          liqCalldata = coder.encode(
            [Liquidation.CROSS_CURRENCY_FCASH_PARAMS],
            [
              [
                account,
                this.localCurrency.id.toString(),
                this.collateralCurrencyId?.toString(),
                this.collateralUnderlyingAddress,
                this.maturities,
                this.maturities.map(() => 0),
                this.getTradeDataParams(collateralTrade),
              ],
            ]
          );
        }
        break;
    }

    return coder.encode(
      ['tuple(uint8,bool,bool,bool,bytes,bytes)'],
      [
        [
          this.type,
          withdraw,
          this.hasTransferFee,
          true, // trade in WETH
          preLiquidationTrade ? this.encodeTradeData(preLiquidationTrade) : [],
          liqCalldata,
        ],
      ]
    );
  }

  public getFlashLoanAmountCall(notional: Contract, account: string) {
    // TODO: enable this once we figure out how to deal with nToken residuals
    /*if (
      this.type === LiquidationType.LOCAL_CURRENCY ||
      this.type === LiquidationType.COLLATERAL_CURRENCY
    ) {
      // Determine if nToken account has residuals
      let currencyId = this.localCurrencyId;
      if (this.type === LiquidationType.COLLATERAL_CURRENCY)
        currencyId = this.collateralCurrencyId;

      const system = System.getSystem();
      const currency = system.getCurrencyById(currencyId);
      const nTokenBalance = (await proxy.getAccountBalance(currencyId, address))
        .nTokenBalance;
      console.log(
        `${currency.nTokenSymbol} balance: ${nTokenBalance.toString()}`
      );
      if (nTokenBalance.gt(0) && currency.nTokenSymbol) {
        const redeemAmount = TypedBigNumber.from(
          nTokenBalance,
          BigNumberType.nToken,
          currency.nTokenSymbol as string
        );

        try {
          NTokenValue.getAssetFromRedeemNToken(currencyId, redeemAmount);
        } catch (e: any) {
          console.error(e);
          console.log(`${address} has nToken residuals`);
          this.residuals = true;
        }
      }
    }*/

    switch (this.type) {
      case LiquidationType.LOCAL_CURRENCY: {
        const key = `${account}:${this.type}:${this.localCurrency.id}:0`;
        return [
          {
            stage: 0,
            target: notional,
            transform: (r) => r[0],
            method: 'calculateLocalCurrencyLiquidation',
            args: [account, this.localCurrency.id, 0],
            key: `${key}:pCashLoanAmount`,
          },
          {
            stage: 1,
            target: notional,
            method: 'convertCashBalanceToExternal',
            args: (r) => [
              this.localCurrency.id,
              r[`${key}:pCashLoanAmount`] || 0,
              true,
            ],
            key: `${key}:loanAmount`,
          },
        ];
      }
      case LiquidationType.COLLATERAL_CURRENCY: {
        const key = `${account}:${this.type}:${this.localCurrency.id}:${this.collateralCurrencyId}`;
        return [
          {
            stage: 0,
            target: notional,
            transform: (r) => r[0],
            method: 'calculateCollateralCurrencyLiquidation',
            args: [
              account,
              this.localCurrency.id,
              this.collateralCurrencyId,
              0,
              0,
            ],
            key: `${key}:pCashLoanAmount`,
          },
          {
            stage: 1,
            target: notional,
            method: 'convertCashBalanceToExternal',
            args: (r) => [
              this.localCurrency.id,
              r[`${key}:pCashLoanAmount`] || 0,
              true,
            ],
            key: `${key}:loanAmount`,
          },
        ];
      }
      case LiquidationType.LOCAL_FCASH: {
        const key = `${account}:${this.type}:${this.localCurrency.id}:0`;
        return [
          {
            stage: 0,
            target: notional,
            transform: (r) => r[1],
            method: 'calculatefCashLocalLiquidation',
            args: [
              account,
              this.localCurrency.id,
              this.maturities,
              this.maturities.map(() => 0),
            ],
            key: `${key}:pCashLoanAmount`,
          },
          {
            stage: 1,
            target: notional,
            method: 'convertCashBalanceToExternal',
            args: (r) => [
              this.localCurrency.id,
              r[`${key}:pCashLoanAmount`] || 0,
              true,
            ],
            key: `${key}:loanAmount`,
          },
        ];
      }
      case LiquidationType.CROSS_CURRENCY_FCASH: {
        const key = `${account}:${this.type}:${this.localCurrency.id}:${this.collateralCurrencyId}`;
        return [
          {
            stage: 0,
            target: notional,
            transform: (r) => r[1],
            method: 'calculatefCashCrossCurrencyLiquidation',
            args: [
              account,
              this.localCurrency.id,
              this.collateralCurrencyId,
              this.maturities,
              this.maturities.map(() => 0),
            ],
            key: `${key}:pCashLoanAmount`,
          },
          {
            stage: 1,
            target: notional,
            method: 'convertCashBalanceToExternal',
            args: (r) => [
              this.localCurrency.id,
              r[`${key}:pCashLoanAmount`] || 0,
              true,
            ],
            key: `${key}:loanAmount`,
          },
        ];
      }
    }

    throw Error('Invalid liquidation type');
  }

  private getResidualCurrencyId(): number {
    if (!this.hasResiduals) return 0;
    return this.type == LiquidationType.LOCAL_CURRENCY
      ? this.localCurrency.id
      : this.collateralCurrencyId;
  }

  /*public getLiquidatorAddress(network: string): string {
    return this.residuals
      ? Config.getManualLiquidatorAddress(network, this.getResidualCurrencyId())
      : Config.getFlashLiquidatorAddress(network);
  }*/

  public toString(): string {
    return `type=${this.type} localCurrencyId=${this.localCurrency.id} collateralCurrencyId=${this.collateralCurrencyId} residuals=${this.residuals}`;
  }
}
