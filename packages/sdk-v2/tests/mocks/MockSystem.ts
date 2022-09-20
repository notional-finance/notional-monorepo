import { BigNumber, ethers } from 'ethers';
import { System } from '../../src/system';
import TypedBigNumber from '../../src/libs/TypedBigNumber';
import { Contracts, IncentiveFactors, IncentiveMigration } from '../../src/libs/types';
import GraphClient from '../../src/data/GraphClient';
import { decodeJSON } from '../../src/data/SystemData';
import { Asset, CashGroupData, nToken, StakedNoteParameters, VaultConfig } from '../../src/data';

const MockSystemData = require('./MockSystemData.json');

export type MutableForTesting<T> = {
  -readonly [K in keyof T]: T[K];
};

export default class MockSystem extends System {
  constructor() {
    const provider = new ethers.providers.JsonRpcBatchProvider('http://localhost:8545');
    const initData = decodeJSON(MockSystemData, provider);
    super(
      'none',
      {} as unknown as GraphClient,
      {
        weth: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
      } as unknown as Contracts,
      provider,
      0,
      'local',
      false,
      initData
    );
  }

  public setNTokenSupply(currencyId: number, totalSupply: TypedBigNumber) {
    const nToken: MutableForTesting<nToken> = this.data.nTokenData.get(currencyId)!;
    nToken.totalSupply = totalSupply;
    this.data.nTokenData.set(currencyId, nToken);
  }

  public setNTokenEmission(currencyId: number, emissionRate: BigNumber) {
    const nToken: MutableForTesting<nToken> = this.data.nTokenData.get(currencyId)!;
    nToken.incentiveEmissionRate = emissionRate;
    this.data.nTokenData.set(currencyId, nToken);
  }

  public setNTokenPortfolio(
    currencyId: number,
    cashBalance: TypedBigNumber,
    pv: TypedBigNumber,
    totalSupply: TypedBigNumber,
    liquidityTokens: Asset[],
    fCash: Asset[]
  ) {
    const nToken: MutableForTesting<nToken> = this.data.nTokenData.get(currencyId)!;
    nToken.cashBalance = cashBalance;
    nToken.assetCashPV = pv;
    nToken.totalSupply = totalSupply;
    nToken.liquidityTokens = liquidityTokens;
    nToken.fCash = fCash;
    this.data.nTokenData.set(currencyId, nToken);
  }

  public setSettlementRate(currencyId: number, maturity: number, rate: BigNumber) {
    const key = `${currencyId}:${maturity}`;
    this.settlementRates.set(key, rate);
  }

  public setSettlementMarket(
    currencyId: number,
    maturity: number,
    market: {
      settlementDate: number;
      totalfCash: TypedBigNumber;
      totalAssetCash: TypedBigNumber;
      totalLiquidity: TypedBigNumber;
    }
  ) {
    const key = `${currencyId}:${market.settlementDate}:${maturity}`;
    this.settlementMarkets.set(key, market);
  }

  public setStakedNoteParameters(params: StakedNoteParameters) {
    this.data.StakedNoteParameters = params;
  }

  public setIncentiveMigration(currencyId: number, params: IncentiveMigration) {
    const nToken: MutableForTesting<nToken> = this.data.nTokenData.get(currencyId)!;
    nToken.integralTotalSupply = params.integralTotalSupply;
    nToken.migratedEmissionRate = params.migratedEmissionRate;
    nToken.migrationTime = params.migrationTime;
    this.data.nTokenData.set(currencyId, nToken);
  }

  public setIncentiveFactors(currencyId: number, params: IncentiveFactors) {
    const nToken: MutableForTesting<nToken> = this.data.nTokenData.get(currencyId)!;
    nToken.accumulatedNOTEPerNToken = params.accumulatedNOTEPerNToken;
    nToken.lastAccumulatedTime = params.lastAccumulatedTime;
    this.data.nTokenData.set(currencyId, nToken);
  }

  public setCashGroup(currencyId: number, params: CashGroupData) {
    this.data.cashGroups.set(currencyId, params);
  }

  public setVault(vault: VaultConfig) {
    this.data.vaults.set(vault.vaultAddress, vault);
  }
}
