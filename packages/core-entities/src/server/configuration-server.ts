import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import { Network } from '@notional-finance/util';

type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

type AllConfigurationQuery = {
  currencyConfigurations: Array<Pick<CurrencyConfiguration, 'id'>>;
};

type Maybe<T> = T | null;

type InterestRateCurve = {
  /** ID is the currency id:market index:true if current */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  kinkUtilization1: Scalars['Int'];
  kinkUtilization2: Scalars['Int'];
  kinkRate1: Scalars['Int'];
  kinkRate2: Scalars['Int'];
  maxRate: Scalars['Int'];
  minFeeRate: Scalars['Int'];
  maxFeeRate: Scalars['Int'];
  feeRatePercent: Scalars['Int'];
};

type CurrencyConfiguration = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  underlying?: Maybe<Token>;
  pCash?: Maybe<Token>;
  /** Some currencies will not allow prime debt */
  pDebt?: Maybe<Token>;
  maxUnderlyingSupply?: Maybe<Scalars['BigInt']>;
  /** Exchange Rate Parameters */
  collateralHaircut?: Maybe<Scalars['Int']>;
  debtBuffer?: Maybe<Scalars['Int']>;
  liquidationDiscount?: Maybe<Scalars['Int']>;
  /** Prime Cash Parameters */
  primeCashRateOracleTimeWindowSeconds?: Maybe<Scalars['Int']>;
  primeCashHoldingsOracle?: Maybe<Scalars['Bytes']>;
  primeCashCurve?: Maybe<InterestRateCurve>;
  primeDebtAllowed?: Maybe<Scalars['Boolean']>;
  /** Time window in seconds that the rate oracle will be averaged over */
  fCashRateOracleTimeWindowSeconds?: Maybe<Scalars['Int']>;
  /** Share of the fees given to the protocol, denominated in percentage */
  fCashReserveFeeSharePercent?: Maybe<Scalars['Int']>;
  /** Debt buffer specified in basis points */
  fCashDebtBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** fCash haircut specified in basis points */
  fCashHaircutBasisPoints?: Maybe<Scalars['Int']>;
  /** Minimum oracle rate applied to fCash haircut */
  fCashMinOracleRate?: Maybe<Scalars['Int']>;
  /** Maximum oracle rate applied to fCash buffer */
  fCashMaxOracleRate?: Maybe<Scalars['Int']>;
  /** Maximum discount factor applied to fCash haircut */
  fCashMaxDiscountFactor?: Maybe<Scalars['Int']>;
  /** Discount on fCash given to the liquidator in basis points */
  fCashLiquidationHaircutBasisPoints?: Maybe<Scalars['Int']>;
  /** Discount on negative fCash given to the liquidator in basis points */
  fCashLiquidationDebtBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** Current set of interest rate curves for the fCash markets */
  fCashActiveCurves?: Maybe<Array<InterestRateCurve>>;
  /** Next set of interest rate curves for the fCash markets */
  fCashNextCurves?: Maybe<Array<InterestRateCurve>>;
  /** The minimum threshold of the reserve before they can be harvested */
  treasuryReserveBuffer?: Maybe<Scalars['BigInt']>;
  /** Addresses of potential prime cash holdings */
  primeCashHoldings?: Maybe<Array<Scalars['Bytes']>>;
  /** Rebalancing targets */
  rebalancingTargets?: Maybe<Array<Scalars['Int']>>;
  /** Rebalancing cooldown */
  rebalancingCooldown?: Maybe<Scalars['Int']>;
  /** Proportion of deposits that go into each corresponding market */
  depositShares?: Maybe<Array<Scalars['Int']>>;
  /** Maximum market proportion that the nToken will provide liquidity at */
  leverageThresholds?: Maybe<Array<Scalars['Int']>>;
  /** Market proportions used during market initialization */
  proportions?: Maybe<Array<Scalars['Int']>>;
  deprecated_anchorRates?: Maybe<Array<Scalars['Int']>>;
  /** Annual incentive emission rate */
  incentiveEmissionRate?: Maybe<Scalars['BigInt']>;
  secondaryIncentiveRewarder?: Maybe<Scalars['Bytes']>;
  /** Residual purchase incentive in basis points */
  residualPurchaseIncentiveBasisPoints?: Maybe<Scalars['Int']>;
  /** Seconds until residuals become available to purchase after market initialization */
  residualPurchaseTimeBufferSeconds?: Maybe<Scalars['Int']>;
  /** Basis points of cash withholding for negative fCash */
  cashWithholdingBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** Percentage of the nToken PV that is used during free collateral */
  pvHaircutPercentage?: Maybe<Scalars['Int']>;
  /** Discount on nToken PV given to liquidators */
  liquidationHaircutPercentage?: Maybe<Scalars['Int']>;
};

type Token = {
  /**
   * ID space varies by token type:
   * - ERC20: token address
   * - ERC1155: `emitter address:tokenId`
   *
   */
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['Int'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash?: Maybe<Scalars['Bytes']>;
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash?: Maybe<Scalars['Bytes']>;
  tokenType: TokenType;
  tokenInterface: TokenInterface;
  /** A link to the underlying token if this token is not underlying itself */
  underlying?: Maybe<Token>;
  /** Set to the notional currency id if this token is listed on Notional */
  currencyId?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  symbol: Scalars['String'];
  decimals: Scalars['Int'];
  precision: Scalars['BigInt'];
  /** Only updated for Notional entities */
  totalSupply?: Maybe<Scalars['BigInt']>;
  /** Set to true for underlying tokens that have a transfer fee */
  hasTransferFee: Scalars['Boolean'];
  isfCashDebt: Scalars['Boolean'];
  /** Maturities are only set for some token types */
  maturity?: Maybe<Scalars['Int']>;
  /** Vault address is set for vault token types */
  vaultAddress?: Maybe<Scalars['Bytes']>;
  /** Set to the ERC20 address or Notional Proxy for ERC1155 addresses */
  tokenAddress: Scalars['Bytes'];
};

type TokenInterface =
  | 'ERC20'
  | 'ERC1155'
  /** Used to designate off chain fiat currencies like USD, JPY, etc */
  | 'FIAT';

type TokenType =
  | 'Underlying'
  | 'nToken'
  | 'WrappedfCash'
  | 'PrimeCash'
  | 'PrimeDebt'
  | 'fCash'
  | 'VaultShare'
  | 'VaultDebt'
  | 'VaultCash'
  | 'NOTE'
  | 'Fiat';

export class ConfigurationServer extends ServerRegistry<AllConfigurationQuery> {
  /** Returns the all configuration query type as is, parsing will be done in the client */
  protected async _refresh(network: Network) {
    const { AllConfigurationDocument } = await loadGraphClientDeferred();
    return this._fetchUsingGraph(network, AllConfigurationDocument, (r) => {
      return { [network]: r };
    });
  }
}
