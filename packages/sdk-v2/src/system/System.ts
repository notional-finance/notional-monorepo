import { gql } from '@apollo/client/core';
import { BigNumber, ethers } from 'ethers';
import EventEmitter from 'eventemitter3';
import {
  AssetType,
  Contracts,
  IncentiveMigration,
  SettlementMarket,
} from '../libs/types';
import { getNowSeconds } from '../libs/utils';
import {
  DEFAULT_DATA_REFRESH_INTERVAL,
  ETHER_CURRENCY_ID,
  NOTE_CURRENCY_ID,
  STAKED_NOTE_CURRENCY_ID,
} from '../config/constants';

import { ERC20, IAggregator } from '@notional-finance/contracts';
import GraphClient from '../data/GraphClient';
import CashGroup from './CashGroup';
import Market from './Market';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { fetchAndDecodeSystem } from '../data/SystemData';
import {
  Asset,
  Currency,
  SystemData,
  nToken,
  ETHRate,
  TradingEstimate,
  VaultState,
} from '../data';
import { StakedNote } from '../staking';

export enum SystemEvents {
  CONFIGURATION_UPDATE = 'CONFIGURATION_UPDATE',
  DATA_REFRESH = 'DATA_REFRESH',
  MARKET_UPDATE = 'MARKET_UPDATE',
  NTOKEN_PV_UPDATE = 'NTOKEN_PV_UPDATE',
  NTOKEN_SUPPLY_UPDATE = 'NTOKEN_SUPPLY_UPDATE',
  NTOKEN_ACCOUNT_UPDATE = 'NTOKEN_ACCOUNT_UPDATE',
  ASSET_RATE_UPDATE = 'ASSET_RATE_UPDATE',
  BLOCK_SUPPLY_RATE_UPDATE = 'BLOCK_SUPPLY_RATE_UPDATE',
  ETH_RATE_UPDATE = 'ETH_RATE_UPDATE',
  NOTE_PRICE_UPDATE = 'NOTE_PRICE_UPDATE',
}

const settlementMarketsQuery = gql`
  query getMarketsAt($currencyId: String!, $settlementDate: Int!) {
    markets(where: { currency: $currencyId, settlementDate: $settlementDate }) {
      id
      maturity
      totalfCash
      totalAssetCash
      totalLiquidity
    }
  }
`;

interface SettlementMarketsQueryResponse {
  markets: {
    id: string;
    maturity: number;
    totalfCash: string;
    totalAssetCash: string;
    totalLiquidity: string;
  }[];
}

const settlementRateQuery = gql`
  query getSettlementRate($currencyId: String!, $maturity: Int!) {
    settlementRates(where: { maturity: $maturity, currency: $currencyId }) {
      id
      assetExchangeRate {
        id
      }
      maturity
      rate
    }
  }
`;

interface SettlementRateQueryResponse {
  settlementRates: {
    id: string;
    assetExchangeRate: {
      id: string;
    } | null;
    maturity: string;
    rate: string;
  }[];
}

interface IAssetRateProvider {
  getAssetRate(): BigNumber;
}

interface IMarketProvider {
  getMarket(): Market;
}

interface IETHRateProvider {
  getETHRate(): ETHRate;
}

interface INTokenAssetCashPVProvider {
  getNTokenAssetCashPV(): TypedBigNumber;
}

export default class System {
  public eventEmitter = new EventEmitter();

  // eslint-disable-next-line no-use-before-define
  private static _systemInstance?: System;

  protected data: SystemData;

  public get lastUpdateBlockNumber() {
    return this.data.lastUpdateBlockNumber;
  }

  public get lastUpdateTimestamp() {
    return this.data.lastUpdateTimestamp;
  }

  public static getSystem() {
    if (!this._systemInstance) throw Error('System not initialized');
    return this._systemInstance;
  }

  public static overrideSystem(system: System) {
    // NOTE: this should only be used for testing
    this._systemInstance = system;
  }

  protected settlementRates = new Map<string, BigNumber>();

  protected settlementMarkets = new Map<string, SettlementMarket>();

  private dataRefreshInterval?: NodeJS.Timeout;

  private ethRateProviders = new Map<number, IETHRateProvider>();

  private assetRateProviders = new Map<number, IAssetRateProvider>();

  private nTokenAssetCashPVProviders = new Map<
    number,
    INTokenAssetCashPVProvider
  >();

  private marketProviders = new Map<string, IMarketProvider>();

  public static async load(
    cacheUrl: string,
    graphClient: GraphClient,
    contracts: Contracts,
    batchProvider: ethers.providers.JsonRpcBatchProvider,
    refreshIntervalMS = DEFAULT_DATA_REFRESH_INTERVAL,
    skipFetchSetup = false
  ) {
    const initData = await fetchAndDecodeSystem(
      cacheUrl,
      batchProvider,
      skipFetchSetup
    );
    const network = await batchProvider.getNetwork();
    return new System(
      cacheUrl,
      graphClient,
      contracts,
      batchProvider,
      refreshIntervalMS,
      network.name === 'homestead' ? 'mainnet' : network.name,
      skipFetchSetup,
      initData
    );
  }

  constructor(
    public cacheUrl: string,
    public graphClient: GraphClient,
    private contracts: Contracts,
    public batchProvider: ethers.providers.JsonRpcBatchProvider,
    public refreshIntervalMS: number,
    public network: string,
    public skipFetchSetup: boolean,
    initData: SystemData
  ) {
    // eslint-disable-next-line no-underscore-dangle
    System._systemInstance = this;
    this.data = initData;
    if (refreshIntervalMS > 0) {
      this.dataRefreshInterval = setInterval(async () => {
        this.data = await fetchAndDecodeSystem(
          this.cacheUrl,
          this.batchProvider,
          skipFetchSetup
        );
        this.eventEmitter.emit(SystemEvents.DATA_REFRESH);
      }, this.refreshIntervalMS);
    }
    this.eventEmitter.emit(SystemEvents.DATA_REFRESH);
  }

  public destroy() {
    if (this.dataRefreshInterval) clearInterval(this.dataRefreshInterval);
    // eslint-disable-next-line no-underscore-dangle
    System._systemInstance = undefined;
  }

  /** Contracts * */

  public getNotionalProxy() {
    return this.contracts.notionalProxy;
  }

  public getNOTE() {
    return this.contracts.note;
  }

  public getStakedNote() {
    return this.contracts.sNOTE;
  }

  public getWETH() {
    return this.contracts.weth;
  }

  public getCOMP() {
    return this.contracts.comp;
  }

  public getTreasuryManager() {
    return this.contracts.treasury;
  }

  public getExchangeV3() {
    return this.contracts.exchangeV3;
  }

  /** Staked NOTE * */

  public getStakedNoteParameters() {
    return this.data.StakedNoteParameters;
  }

  /** Currencies * */
  public getAllCurrencies(): Currency[] {
    return Array.from(this.data.currencies.values()).sort((a, b) =>
      a.assetSymbol.localeCompare(b.assetSymbol)
    );
  }

  public getTradableCurrencies(): Currency[] {
    return this.getAllCurrencies().filter((c) => this.isTradable(c.id));
  }

  public getCurrencyBySymbol(symbol: string): Currency {
    const currency = this.getAllCurrencies().find(
      (c) =>
        c.assetSymbol === symbol ||
        c.underlyingSymbol === symbol ||
        c.nTokenSymbol === symbol
    );
    if (!currency) throw Error(`Currency ${symbol} not found`);
    return currency;
  }

  public getTokenBySymbol(symbol: string): ERC20 {
    if (symbol === 'sNOTE') {
      return this.getStakedNote() as ERC20;
    }
    if (symbol === 'NOTE') {
      return this.getNOTE() as ERC20;
    }
    if (symbol === 'WETH') {
      return this.getWETH() as ERC20;
    }
    const currency = this.getCurrencyBySymbol(symbol);
    return currency.assetSymbol === symbol
      ? currency.assetContract
      : currency.underlyingContract!;
  }

  public getCurrencyById(id: number): Currency {
    const currency = this.data.currencies.get(id);
    if (!currency) throw new Error(`Currency ${id} not found`);
    return currency;
  }

  public getUnderlyingSymbol(id: number): string {
    const currency = this.getCurrencyById(id);
    return currency.underlyingSymbol || currency.assetSymbol;
  }

  public isTradable(currencyId: number): boolean {
    return this.data.cashGroups.has(currencyId);
  }

  /** Cash Group and Market * */

  public getCashGroup(currencyId: number): CashGroup {
    const cashGroupData = this.data.cashGroups.get(currencyId);
    const currency = this.data.currencies.get(currencyId);
    if (!cashGroupData || !currency)
      throw new Error(`Cash group ${currencyId} not found`);
    return new CashGroup(currency, cashGroupData);
  }

  public getMarkets(currencyId: number): Market[] {
    const cashGroup = this.getCashGroup(currencyId);
    return cashGroup.markets.map(
      (m) =>
        this.marketProviders.get(m.marketKey)?.getMarket() ?? Market.copy(m)
    );
  }

  /** Exchange Rate Data * */

  public getAssetRate(currencyId: number) {
    const assetRateData = this.data.assetRateData.get(currencyId);
    if (!assetRateData) throw new Error(`Asset Rate ${currencyId} not found`);
    const provider = this.assetRateProviders.get(currencyId);
    const assetRate = provider?.getAssetRate() ?? assetRateData.latestRate;
    return {
      underlyingDecimalPlaces: assetRateData.underlyingDecimalPlaces,
      assetRate,
    };
  }

  public getAnnualizedSupplyRate(currencyId: number) {
    const assetRateData = this.data.assetRateData.get(currencyId);
    if (!assetRateData) throw new Error(`Asset Rate ${currencyId} not found`);
    return assetRateData.annualSupplyRate;
  }

  public getETHProvider(currencyId: number) {
    return this.ethRateProviders.get(currencyId);
  }

  private _getUSDCRate() {
    const USDC = this.getCurrencyBySymbol('USDC');
    const usdcETHRate = this.data.ethRateData.get(USDC.id);
    if (!usdcETHRate) throw new Error(`USDC/ETH Rate not found`);
    const rateDecimals = BigNumber.from(10).pow(usdcETHRate.rateDecimalPlaces);
    return {
      rateDecimals,
      usdcRate: usdcETHRate.latestRate,
    };
  }

  public getUSDRate(symbol: string) {
    if (symbol === 'USD') return ethers.constants.WeiPerEther;

    // If in USDExchangeRates then return
    const usdRate = this.data.USDExchangeRates.get(symbol);
    if (!usdRate) {
      // USD Rate = DAI/ETH => ETH/DAI * USDC/ETH == USDC/DAI
      let currencyId: number;
      if (symbol === 'NOTE') {
        currencyId = NOTE_CURRENCY_ID;
      } else if (symbol === 'sNOTE') {
        currencyId = STAKED_NOTE_CURRENCY_ID;
      } else {
        ({ id: currencyId } = this.getCurrencyBySymbol(symbol));
      }
      const { rateDecimals, usdcRate } = this._getUSDCRate();
      const { latestRate, rateDecimalPlaces } = this.getETHRate(currencyId);

      // Invert the ETH Rate
      const ethRateDecimals = BigNumber.from(10).pow(rateDecimalPlaces);
      const invertRate = ethRateDecimals.mul(ethRateDecimals).div(latestRate);
      // inverted rate * 1e18 * usdcRate / (invertedRateDecimals * usdcRateDecimals)
      // returns USDC/symbol in 18 decimals
      return invertRate
        .mul(ethers.constants.WeiPerEther)
        .mul(usdcRate)
        .div(ethRateDecimals)
        .div(rateDecimals);
    }

    return usdRate;
  }

  public getETHRate(currencyId: number): ETHRate {
    // If in ETH Rate then return
    // If in USDExchangeRates then use USDC as a proxy
    const ethRateProvider = this.ethRateProviders.get(currencyId);
    if (ethRateProvider) {
      return ethRateProvider.getETHRate();
    }

    if (currencyId === NOTE_CURRENCY_ID) {
      // Special case, we use the Balancer pool's oracle price here instead
      return {
        rateOracle: null as unknown as IAggregator,
        // NOTE/USD Rate is always in 18 decimal places
        rateDecimalPlaces: 18,
        mustInvert: false,
        buffer: 100,
        haircut: 100,
        latestRate: this.data.StakedNoteParameters.noteETHOraclePrice,
        liquidationDiscount: 100,
      };
    }
    if (currencyId === STAKED_NOTE_CURRENCY_ID) {
      return {
        rateOracle: null as unknown as IAggregator,
        // sNOTE/ETH Rate is always in 18 decimal places
        rateDecimalPlaces: 18,
        mustInvert: false,
        buffer: 100,
        haircut: 100,
        latestRate: StakedNote.getStakedNOTEExchangeRate().n,
        liquidationDiscount: 100,
      };
    }

    const ethRate = this.data.ethRateData.get(currencyId);
    if (!ethRate) throw new Error(`ETH Rate ${currencyId} not found`);
    return ethRate;
  }

  /** nToken Data * */

  public getNToken(currencyId: number): nToken | undefined {
    return this.data.nTokenData.get(currencyId);
  }

  public getNTokenAssetCashPV(currencyId: number) {
    const nTokenAssetCashPVProvider =
      this.nTokenAssetCashPVProviders.get(currencyId);
    if (nTokenAssetCashPVProvider) {
      return nTokenAssetCashPVProvider.getNTokenAssetCashPV();
    }
    return this.data.nTokenData.get(currencyId)?.assetCashPV;
  }

  public getNTokenTotalSupply(currencyId: number) {
    return this.data.nTokenData.get(currencyId)?.totalSupply;
  }

  public getNTokenPortfolio(currencyId: number) {
    const nTokenData = this.data.nTokenData.get(currencyId);
    return {
      cashBalance: nTokenData?.cashBalance,
      liquidityTokens: nTokenData?.liquidityTokens as Asset[] | undefined,
      fCash: nTokenData?.fCash as Asset[] | undefined,
    };
  }

  public getNTokenIncentiveFactors(currencyId: number) {
    return this.data.nTokenData.get(currencyId);
  }

  public getIncentiveMigration(
    currencyId: number
  ): IncentiveMigration | undefined {
    return this.data.nTokenData.get(currencyId);
  }

  /** Vault Data * */

  public getAllVaults(onlyActive = true) {
    return Array.from(this.data.vaults.values()).filter((v) =>
      onlyActive ? v.enabled : true
    );
  }

  public getVaultsByStrategy(strategyId: string, onlyActive = true) {
    return this.getAllVaults(onlyActive).filter(
      (v) => v.strategy === strategyId
    );
  }

  public getVaultsByCurrency(currencyId: number, onlyActive = true) {
    return this.getAllVaults(onlyActive).filter(
      (v) => v.primaryBorrowCurrency === currencyId
    );
  }

  public static getVaultSymbol(vaultAddress: string, maturity: number) {
    return `${vaultAddress}:${maturity}`;
  }

  public getVaultSymbol(vaultAddress: string, maturity: number) {
    return System.getVaultSymbol(vaultAddress, maturity);
  }

  public getDebtShareSymbols(vaultAddress: string, maturity: number) {
    return [
      this.getDebtShareSymbol(vaultAddress, maturity, 0),
      this.getDebtShareSymbol(vaultAddress, maturity, 1),
    ];
  }

  public getDebtShareSymbol(
    vaultAddress: string,
    maturity: number,
    index: 0 | 1
  ) {
    const { secondaryBorrowCurrencies } = this.getVault(vaultAddress);
    if (!secondaryBorrowCurrencies)
      throw Error('Invalid secondary borrow currency');
    if (secondaryBorrowCurrencies[index] !== 0) {
      const symbol = this.getUnderlyingSymbol(secondaryBorrowCurrencies[index]);
      return `${this.getVaultSymbol(vaultAddress, maturity)}:${symbol}`;
    }

    return undefined;
  }

  public getVault(vaultAddress: string) {
    const vault = this.data.vaults.get(vaultAddress);
    if (!vault) throw Error(`Vault at ${vaultAddress} not found`);
    return vault;
  }

  public getVaultJSONParams(vaultAddress: string) {
    // This just returns the raw JSON string from initVaultParams for use
    // in the VaultFactory
    const vaultParams = this.data.initVaultParams.get(vaultAddress);
    if (!vaultParams) throw Error(`Vault at ${vaultAddress} not found`);
    return vaultParams;
  }

  public getVaultState(vaultAddress: string, maturity: number) {
    const vault = this.getVault(vaultAddress);
    const state = vault.vaultStates?.find((s) => s.maturity === maturity);
    if (!state) {
      return {
        maturity,
        isSettled: false,
        totalPrimaryfCashBorrowed: TypedBigNumber.getZeroUnderlying(
          vault.primaryBorrowCurrency
        ),
        totalAssetCash: TypedBigNumber.getZeroUnderlying(
          vault.primaryBorrowCurrency
        ).toAssetCash(),
        totalStrategyTokens: TypedBigNumber.from(
          0,
          BigNumberType.StrategyToken,
          `${vaultAddress}:${maturity}`
        ),
        totalVaultShares: TypedBigNumber.from(
          0,
          BigNumberType.VaultShare,
          `${vaultAddress}:${maturity}`
        ),
      } as VaultState;
    }

    return state;
  }

  /** Trading Estimation Data * */
  private _getTokenAddressForTradingEstimation(symbol: string | number) {
    if (symbol === 'ETH' || symbol === ETHER_CURRENCY_ID) {
      return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    }
    if (typeof symbol === 'number') {
      const currency = this.getCurrencyById(symbol);
      return (
        currency.underlyingContract?.address || currency.assetContract.address
      );
    }
    if (ethers.utils.isAddress(symbol)) {
      return symbol;
    }
    const currency = this.getCurrencyBySymbol(symbol);
    return symbol === currency.underlyingSymbol
      ? currency.underlyingContract!.address
      : currency.assetContract.address;
  }

  public getTradingEstimates(
    sellToken: string | number,
    buyToken: string | number
  ): TradingEstimate {
    const buyTokenAddress = this._getTokenAddressForTradingEstimation(buyToken);
    const sellTokenAddress =
      this._getTokenAddressForTradingEstimation(sellToken);

    const estimate = this.data.tradingEstimates.get(
      `${buyTokenAddress}:${sellTokenAddress}`
    );
    if (!estimate)
      throw Error(`No estimate found for ${buyToken} and ${sellToken}`);
    return estimate;
  }

  /** Override Providers * */

  public clearMarketProviders() {
    this.marketProviders.clear();
  }

  public clearAssetRateProviders() {
    this.assetRateProviders.clear();
  }

  public clearETHRateProviders() {
    this.ethRateProviders.clear();
  }

  public setAssetRateProvider(
    currencyId: number,
    provider: IAssetRateProvider | null
  ) {
    if (!provider) {
      this.assetRateProviders.delete(currencyId);
      return;
    }
    this.assetRateProviders.set(currencyId, provider);
  }

  public setMarketProvider(
    marketKey: string,
    provider: IMarketProvider | null
  ) {
    if (!provider) {
      this.marketProviders.delete(marketKey);
      return;
    }
    this.marketProviders.set(marketKey, provider);
  }

  public setETHRateProvider(
    currencyId: number,
    provider: IETHRateProvider | null
  ) {
    if (!provider) {
      this.ethRateProviders.delete(currencyId);
      return;
    }
    this.ethRateProviders.set(currencyId, provider);
  }

  public setNTokenAssetCashPVProvider(
    currencyId: number,
    provider: INTokenAssetCashPVProvider | null
  ) {
    if (!provider) {
      this.nTokenAssetCashPVProviders.delete(currencyId);
      return;
    }
    this.nTokenAssetCashPVProviders.set(currencyId, provider);
  }

  /** Settlement Rates * */

  // Fetch and set settlement rates
  public async settlePortfolioAsset(
    asset: Asset,
    currentTime = getNowSeconds()
  ) {
    if (asset.settlementDate > currentTime)
      throw Error('Asset has not settled');

    if (asset.assetType === AssetType.fCash) {
      // If an asset is fCash then we settle to cash directly
      const rate = await this.getSettlementRate(
        asset.currencyId,
        asset.maturity
      );
      return {
        assetCash: asset.notional.toAssetCash(true, rate),
        fCashAsset: undefined,
      };
    }

    const settlementMarket = await this.getSettlementMarket(
      asset.currencyId,
      asset.maturity,
      asset.settlementDate
    );
    const fCashClaim = settlementMarket.totalfCash.scale(
      asset.notional.n,
      settlementMarket.totalLiquidity.n
    );
    const assetCashClaim = settlementMarket.totalAssetCash.scale(
      asset.notional.n,
      settlementMarket.totalLiquidity.n
    );
    if (asset.maturity <= currentTime) {
      // fCash asset has settled as well
      const rate = await this.getSettlementRate(
        asset.currencyId,
        asset.maturity
      );
      return {
        assetCash: assetCashClaim.add(fCashClaim.toAssetCash(true, rate)),
        fCashAsset: undefined,
      };
    }

    return {
      assetCash: assetCashClaim,
      fCashAsset: {
        currencyId: asset.currencyId,
        maturity: asset.maturity,
        assetType: AssetType.fCash,
        notional: fCashClaim,
        hasMatured: false,
        settlementDate: asset.maturity,
        isIdiosyncratic: CashGroup.isIdiosyncratic(asset.maturity, currentTime),
      },
    };
  }

  private async getSettlementRate(currencyId: number, maturity: number) {
    const key = `${currencyId}:${maturity}`;
    if (this.settlementRates.has(key)) {
      return this.settlementRates.get(key)!;
    }

    const settlementRateResponse =
      await this.graphClient.queryOrThrow<SettlementRateQueryResponse>(
        settlementRateQuery,
        { currencyId: currencyId.toString(), maturity }
      );

    // eslint-disable-next-line
    const isSettlementRateSet =
      settlementRateResponse.settlementRates.length > 0 &&
      settlementRateResponse.settlementRates[0].assetExchangeRate;

    if (!isSettlementRateSet) {
      // This means the rate is not set and we get the current asset rate, don't set the rate here
      // will refetch on the next call.
      const { underlyingDecimalPlaces, assetRate } =
        this.getAssetRate(currencyId);
      if (!assetRate || !underlyingDecimalPlaces)
        throw new Error(`Asset rate data for ${currencyId} is not found`);

      return assetRate;
    }

    const settlementRate = settlementRateResponse.settlementRates[0];
    const rate = BigNumber.from(settlementRate.rate);
    this.settlementRates.set(key, rate);
    return rate;
  }

  private async getSettlementMarket(
    currencyId: number,
    maturity: number,
    settlementDate: number
  ) {
    const key = `${currencyId}:${settlementDate}:${maturity}`;
    if (this.settlementMarkets.has(key)) {
      return this.settlementMarkets.get(key)!;
    }

    const settlementMarkets =
      await this.graphClient.queryOrThrow<SettlementMarketsQueryResponse>(
        settlementMarketsQuery,
        { currencyId: currencyId.toString(), settlementDate }
      );
    settlementMarkets.markets.forEach((m) => {
      const k = `${currencyId}:${settlementDate}:${m.maturity}`;
      const currency = this.getCurrencyById(currencyId);
      const underlyingSymbol = this.getUnderlyingSymbol(currencyId);
      this.settlementMarkets.set(k, {
        settlementDate,
        totalfCash: TypedBigNumber.from(
          m.totalfCash,
          BigNumberType.InternalUnderlying,
          underlyingSymbol
        ),
        totalAssetCash: TypedBigNumber.from(
          m.totalAssetCash,
          BigNumberType.InternalAsset,
          currency.assetSymbol
        ),
        totalLiquidity: TypedBigNumber.from(
          m.totalLiquidity,
          BigNumberType.LiquidityToken,
          currency.assetSymbol
        ),
      });
    });

    return this.settlementMarkets.get(key)!;
  }
}
