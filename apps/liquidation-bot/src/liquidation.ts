import { AggregateCall } from '@notional-finance/multicall';
import { LiquidationType, TradeData, Currency } from './types';
import { utils, constants, Contract, BigNumber } from 'ethers';

/**
 * Represents a single liquidation opportunity
 */
export default class Liquidation {
  public static readonly ETH_CURRENCY_ID = 1;
  public static readonly LOCAL_CURRENCY_PARAMS = 'tuple(address,uint16,uint96)';
  public static readonly TRADE_PARAMS =
    'tuple(uint8,address,address,uint256,uint256,uint256,bytes)';
  public static readonly TRADE_DATA_PARAMS = `tuple(${Liquidation.TRADE_PARAMS},uint16,bool,uint32)`;
  public static readonly COLLATERAL_CURRENCY_PARAMS = `tuple(address,uint16,uint16,address,uint128,uint96,${Liquidation.TRADE_DATA_PARAMS})`;
  public static readonly COLLATERAL_CURRENCY_PARAMS_BYTES = `tuple(address,uint16,uint16,address,uint128,uint96,bytes)`;
  public static readonly LOCAL_FCASH_PARAMS =
    'tuple(address,uint16,uint256[],uint256[])';
  public static readonly CROSS_CURRENCY_FCASH_PARAMS = `tuple(address,uint16,uint16,address,uint256[],uint256[],${Liquidation.TRADE_DATA_PARAMS})`;
  public static readonly CROSS_CURRENCY_FCASH_PARAMS_BYTES = `tuple(address,uint16,uint16,address,uint256[],uint256[],bytes)`;

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
          liqCalldata = collateralTrade
            ? coder.encode(
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
              )
            : coder.encode(
                [Liquidation.COLLATERAL_CURRENCY_PARAMS_BYTES],
                [
                  [
                    account,
                    this.localCurrency.id.toString(),
                    this.collateralCurrencyId?.toString(),
                    this.collateralUnderlyingAddress,
                    '0',
                    '0',
                    '0x',
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
          liqCalldata = collateralTrade
            ? coder.encode(
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
              )
            : coder.encode(
                [Liquidation.CROSS_CURRENCY_FCASH_PARAMS_BYTES],
                [
                  [
                    account,
                    this.localCurrency.id.toString(),
                    this.collateralCurrencyId?.toString(),
                    this.collateralUnderlyingAddress,
                    this.maturities,
                    this.maturities.map(() => 0),
                    '0x',
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

  public getFlashLoanAmountCall(
    notional: Contract,
    account: string
  ): AggregateCall[] {
    switch (this.type) {
      case LiquidationType.LOCAL_CURRENCY: {
        const key = `${account}:${this.type}:${this.localCurrency.id}:0`;
        return [
          {
            stage: 0,
            target: notional,
            transform: (r: BigNumber[]) => r[0],
            method: 'calculateLocalCurrencyLiquidation',
            args: [account, this.localCurrency.id, 0],
            key: `${key}:pCashLoanAmount`,
          },
          {
            stage: 1,
            target: notional,
            method: 'convertCashBalanceToExternal',
            args: (r: unknown) => [
              this.localCurrency.id,
              (r as Record<string, BigNumber>)[`${key}:pCashLoanAmount`] || 0,
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
            transform: (r: BigNumber[]) => r[0],
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
            args: (r: unknown) => [
              this.localCurrency.id,
              (r as Record<string, BigNumber>)[`${key}:pCashLoanAmount`] || 0,
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
            transform: (r: BigNumber[]) => r[1],
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
            args: (r: unknown) => [
              this.localCurrency.id,
              (r as Record<string, BigNumber>)[`${key}:pCashLoanAmount`] || 0,
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
            transform: (r: BigNumber[]) => r[1],
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
            args: (r: unknown) => [
              this.localCurrency.id,
              (r as Record<string, BigNumber>)[`${key}:pCashLoanAmount`] || 0,
              true,
            ],
            key: `${key}:loanAmount`,
          },
        ];
      }
    }

    throw Error('Invalid liquidation type');
  }

  public toString(): string {
    return `type=${this.type} localCurrencyId=${this.localCurrency.id} collateralCurrencyId=${this.collateralCurrencyId} residuals=${this.residuals}`;
  }
}
