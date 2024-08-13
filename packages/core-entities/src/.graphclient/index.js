"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultReinvestmentDocument = exports.NetworkTransactionHistoryDocument = exports.MetaDocument = exports.HistoricalTradingActivityDocument = exports.HistoricalOracleValuesDocument = exports.ExternalLendingHistoryDocument = exports.ExchangeRateValuesDocument = exports.AllVaultsByBlockDocument = exports.AllVaultsDocument = exports.AllVaultAccountsDocument = exports.AllTokensByBlockDocument = exports.AllTokensDocument = exports.AllOraclesByBlockDocument = exports.AllOraclesDocument = exports.AllConfigurationByBlockDocument = exports.AllConfigurationDocument = exports.AllAccountsByBlockDocument = exports.AllAccountsDocument = exports.ActiveAccountsDocument = exports.AccountTransactionHistoryDocument = exports.AccountHoldingsHistoricalDocument = exports.AccountBalanceStatementDocument = exports.subscribe = exports.execute = exports.rawServeConfig = void 0;
exports.getMeshOptions = getMeshOptions;
exports.createBuiltMeshHTTPHandler = createBuiltMeshHTTPHandler;
exports.getBuiltGraphClient = getBuiltGraphClient;
exports.getBuiltGraphSDK = getBuiltGraphSDK;
exports.getSdk = getSdk;
const tslib_1 = require("tslib");
const utils_1 = require("@graphql-mesh/utils");
const utils_2 = require("@graphql-mesh/utils");
const utils_3 = require("@graphql-mesh/utils");
const cache_localforage_1 = tslib_1.__importDefault(require("@graphql-mesh/cache-localforage"));
const fetch_1 = require("@whatwg-node/fetch");
const graphql_1 = tslib_1.__importDefault(require("@graphql-mesh/graphql"));
const merger_bare_1 = tslib_1.__importDefault(require("@graphql-mesh/merger-bare"));
const utils_4 = require("@graphql-mesh/utils");
const http_1 = require("@graphql-mesh/http");
const runtime_1 = require("@graphql-mesh/runtime");
const store_1 = require("@graphql-mesh/store");
const cross_helpers_1 = require("@graphql-mesh/cross-helpers");
const importedModule$0 = tslib_1.__importStar(require("./sources/NotionalV3/introspectionSchema"));
const baseDir = cross_helpers_1.path.join(typeof __dirname === 'string' ? __dirname : '/', '..');
const importFn = (moduleId) => {
    const relativeModuleId = (cross_helpers_1.path.isAbsolute(moduleId) ? cross_helpers_1.path.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
    switch (relativeModuleId) {
        case ".graphclient/sources/NotionalV3/introspectionSchema":
            return Promise.resolve(importedModule$0);
        default:
            return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
    }
};
const rootStore = new store_1.MeshStore('.graphclient', new store_1.FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: "ts",
}), {
    readonly: true,
    validate: false
});
exports.rawServeConfig = undefined;
function getMeshOptions() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pubsub = new utils_2.PubSub();
        const sourcesStore = rootStore.child('sources');
        const logger = new utils_3.DefaultLogger("GraphClient");
        const cache = new cache_localforage_1.default(Object.assign(Object.assign({}, {}), { importFn, store: rootStore.child('cache'), pubsub,
            logger }));
        const sources = [];
        const transforms = [];
        const additionalEnvelopPlugins = [];
        const notionalV3Transforms = [];
        const additionalTypeDefs = [];
        const notionalV3Handler = new graphql_1.default({
            name: "NotionalV3",
            config: { "endpoint": "https://gateway-arbitrum.network.thegraph.com/api/f9f58a6131e8807672eaa304ed6abef8/subgraphs/id/{context.subgraphId:4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW}" },
            baseDir,
            cache,
            pubsub,
            store: sourcesStore.child("NotionalV3"),
            logger: logger.child("NotionalV3"),
            importFn,
        });
        sources[0] = {
            name: 'NotionalV3',
            handler: notionalV3Handler,
            transforms: notionalV3Transforms
        };
        const additionalResolvers = [];
        const merger = new merger_bare_1.default({
            cache,
            pubsub,
            logger: logger.child('bareMerger'),
            store: rootStore.child('bareMerger')
        });
        return {
            sources,
            transforms,
            additionalTypeDefs,
            additionalResolvers,
            cache,
            pubsub,
            merger,
            logger,
            additionalEnvelopPlugins,
            get documents() {
                return [
                    {
                        document: exports.AccountBalanceStatementDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AccountBalanceStatementDocument);
                        },
                        location: 'AccountBalanceStatementDocument.graphql'
                    }, {
                        document: exports.AccountHoldingsHistoricalDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AccountHoldingsHistoricalDocument);
                        },
                        location: 'AccountHoldingsHistoricalDocument.graphql'
                    }, {
                        document: exports.AccountTransactionHistoryDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AccountTransactionHistoryDocument);
                        },
                        location: 'AccountTransactionHistoryDocument.graphql'
                    }, {
                        document: exports.ActiveAccountsDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.ActiveAccountsDocument);
                        },
                        location: 'ActiveAccountsDocument.graphql'
                    }, {
                        document: exports.AllAccountsDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllAccountsDocument);
                        },
                        location: 'AllAccountsDocument.graphql'
                    }, {
                        document: exports.AllAccountsByBlockDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllAccountsByBlockDocument);
                        },
                        location: 'AllAccountsByBlockDocument.graphql'
                    }, {
                        document: exports.AllConfigurationDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllConfigurationDocument);
                        },
                        location: 'AllConfigurationDocument.graphql'
                    }, {
                        document: exports.AllConfigurationByBlockDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllConfigurationByBlockDocument);
                        },
                        location: 'AllConfigurationByBlockDocument.graphql'
                    }, {
                        document: exports.AllOraclesDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllOraclesDocument);
                        },
                        location: 'AllOraclesDocument.graphql'
                    }, {
                        document: exports.AllOraclesByBlockDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllOraclesByBlockDocument);
                        },
                        location: 'AllOraclesByBlockDocument.graphql'
                    }, {
                        document: exports.AllTokensDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllTokensDocument);
                        },
                        location: 'AllTokensDocument.graphql'
                    }, {
                        document: exports.AllTokensByBlockDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllTokensByBlockDocument);
                        },
                        location: 'AllTokensByBlockDocument.graphql'
                    }, {
                        document: exports.AllVaultAccountsDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllVaultAccountsDocument);
                        },
                        location: 'AllVaultAccountsDocument.graphql'
                    }, {
                        document: exports.AllVaultsDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllVaultsDocument);
                        },
                        location: 'AllVaultsDocument.graphql'
                    }, {
                        document: exports.AllVaultsByBlockDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.AllVaultsByBlockDocument);
                        },
                        location: 'AllVaultsByBlockDocument.graphql'
                    }, {
                        document: exports.ExchangeRateValuesDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.ExchangeRateValuesDocument);
                        },
                        location: 'ExchangeRateValuesDocument.graphql'
                    }, {
                        document: exports.ExternalLendingHistoryDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.ExternalLendingHistoryDocument);
                        },
                        location: 'ExternalLendingHistoryDocument.graphql'
                    }, {
                        document: exports.HistoricalOracleValuesDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.HistoricalOracleValuesDocument);
                        },
                        location: 'HistoricalOracleValuesDocument.graphql'
                    }, {
                        document: exports.HistoricalTradingActivityDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.HistoricalTradingActivityDocument);
                        },
                        location: 'HistoricalTradingActivityDocument.graphql'
                    }, {
                        document: exports.MetaDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.MetaDocument);
                        },
                        location: 'MetaDocument.graphql'
                    }, {
                        document: exports.NetworkTransactionHistoryDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.NetworkTransactionHistoryDocument);
                        },
                        location: 'NetworkTransactionHistoryDocument.graphql'
                    }, {
                        document: exports.VaultReinvestmentDocument,
                        get rawSDL() {
                            return (0, utils_4.printWithCache)(exports.VaultReinvestmentDocument);
                        },
                        location: 'VaultReinvestmentDocument.graphql'
                    }
                ];
            },
            fetchFn: fetch_1.fetch,
        };
    });
}
function createBuiltMeshHTTPHandler() {
    return (0, http_1.createMeshHTTPHandler)({
        baseDir,
        getBuiltMesh: getBuiltGraphClient,
        rawServeConfig: undefined,
    });
}
let meshInstance$;
function getBuiltGraphClient() {
    if (meshInstance$ == null) {
        meshInstance$ = getMeshOptions().then(meshOptions => (0, runtime_1.getMesh)(meshOptions)).then(mesh => {
            const id = mesh.pubsub.subscribe('destroy', () => {
                meshInstance$ = undefined;
                mesh.pubsub.unsubscribe(id);
            });
            return mesh;
        });
    }
    return meshInstance$;
}
const execute = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));
exports.execute = execute;
const subscribe = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
exports.subscribe = subscribe;
function getBuiltGraphSDK(globalContext) {
    const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
    return getSdk((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
exports.AccountBalanceStatementDocument = (0, utils_1.gql) `
    query AccountBalanceStatement($accountId: ID!) {
  account(id: $accountId) {
    id
    balances(where: {current_: {currentBalance_not: 0}}) {
      token {
        id
        underlying {
          id
        }
      }
      current {
        timestamp
        blockNumber
        currentBalance
        _accumulatedCostRealized
        adjustedCostBasis
        currentProfitAndLossAtSnapshot
        totalILAndFeesAtSnapshot
        totalProfitAndLossAtSnapshot
        totalInterestAccrualAtSnapshot
        impliedFixedRate
        incentives {
          rewardToken {
            id
            symbol
          }
          totalClaimed
          adjustedClaimed
        }
      }
    }
  }
}
    `;
exports.AccountHoldingsHistoricalDocument = (0, utils_1.gql) `
    query AccountHoldingsHistorical($accountId: ID!, $minTimestamp: Int!) {
  account(id: $accountId) {
    balances(
      where: {token_: {tokenType_not_in: [NOTE, Underlying], currencyId_gt: 0}}
    ) {
      token {
        id
      }
      current {
        timestamp
        currentBalance
      }
      snapshots(
        where: {timestamp_gte: $minTimestamp}
        orderBy: timestamp
        orderDirection: desc
        first: 1000
      ) {
        timestamp
        currentBalance
      }
    }
  }
}
    `;
exports.AccountTransactionHistoryDocument = (0, utils_1.gql) `
    query AccountTransactionHistory($accountId: String!) {
  transactions(
    where: {profitLossLineItems_: {account: $accountId}}
    orderBy: timestamp
    orderDirection: desc
  ) {
    timestamp
    blockNumber
    transactionHash
    profitLossLineItems(where: {account: $accountId, isTransientLineItem: false}) {
      timestamp
      blockNumber
      transactionHash {
        id
      }
      token {
        id
        tokenType
      }
      underlyingToken {
        id
      }
      tokenAmount
      bundle {
        bundleName
      }
      underlyingAmountRealized
      underlyingAmountSpot
      realizedPrice
      spotPrice
      impliedFixedRate
      isTransientLineItem
      account {
        id
      }
    }
  }
}
    `;
exports.ActiveAccountsDocument = (0, utils_1.gql) `
    query ActiveAccounts($skip: Int) {
  accounts(first: 1000, skip: $skip, where: {systemAccountType_in: [None]}) {
    id
    systemAccountType
    balances {
      token {
        id
        tokenType
        currencyId
        isfCashDebt
      }
      current {
        currentBalance
      }
    }
  }
}
    `;
exports.AllAccountsDocument = (0, utils_1.gql) `
    query AllAccounts($skip: Int, $startId: ID, $endId: ID) {
  accounts(
    first: 1000
    skip: $skip
    where: {id_gt: $startId, id_lt: $endId, systemAccountType_in: [None, nToken, FeeReserve, SettlementReserve]}
  ) {
    id
    systemAccountType
    balances {
      token {
        id
        currencyId
        underlying {
          id
        }
      }
      current {
        timestamp
        blockNumber
        currentBalance
      }
    }
  }
}
    `;
exports.AllAccountsByBlockDocument = (0, utils_1.gql) `
    query AllAccountsByBlock($skip: Int, $startId: ID, $endId: ID, $blockNumber: Int) {
  accounts(
    first: 1000
    skip: $skip
    where: {id_gt: $startId, id_lt: $endId, systemAccountType_in: [None, nToken, FeeReserve, SettlementReserve]}
    block: {number: $blockNumber}
  ) {
    id
    systemAccountType
    balances {
      token {
        id
        currencyId
        underlying {
          id
        }
      }
      current {
        timestamp
        blockNumber
        currentBalance
      }
    }
  }
}
    `;
exports.AllConfigurationDocument = (0, utils_1.gql) `
    query AllConfiguration {
  currencyConfigurations {
    id
    underlying {
      id
    }
    pCash {
      id
    }
    pDebt {
      id
    }
    maxUnderlyingSupply
    collateralHaircut
    debtBuffer
    liquidationDiscount
    primeCashRateOracleTimeWindowSeconds
    primeCashHoldingsOracle
    primeCashCurve {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    primeDebtAllowed
    fCashRateOracleTimeWindowSeconds
    fCashReserveFeeSharePercent
    fCashDebtBufferBasisPoints
    fCashHaircutBasisPoints
    fCashMinOracleRate
    fCashMaxOracleRate
    fCashMaxDiscountFactor
    fCashLiquidationHaircutBasisPoints
    fCashLiquidationDebtBufferBasisPoints
    fCashActiveCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    fCashNextCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    treasuryReserveBuffer
    primeCashHoldings
    depositShares
    leverageThresholds
    proportions
    residualPurchaseIncentiveBasisPoints
    residualPurchaseTimeBufferSeconds
    cashWithholdingBufferBasisPoints
    pvHaircutPercentage
    liquidationHaircutPercentage
    maxMintDeviationBasisPoints
    incentives {
      incentiveEmissionRate
      accumulatedNOTEPerNToken
      lastAccumulatedTime
      currentSecondaryReward {
        id
        symbol
      }
      secondaryIncentiveRewarder
      secondaryEmissionRate
      accumulatedSecondaryRewardPerNToken
      lastSecondaryAccumulatedTime
      secondaryRewardEndTime
    }
  }
  vaultConfigurations {
    id
    vaultAddress
    strategy
    name
    primaryBorrowCurrency {
      id
    }
    minAccountBorrowSize
    minCollateralRatioBasisPoints
    maxDeleverageCollateralRatioBasisPoints
    feeRateBasisPoints
    reserveFeeSharePercent
    liquidationRatePercent
    maxBorrowMarketIndex
    secondaryBorrowCurrencies {
      id
    }
    maxRequiredAccountCollateralRatioBasisPoints
    enabled
    allowRollPosition
    onlyVaultEntry
    onlyVaultExit
    onlyVaultRoll
    onlyVaultDeleverage
    onlyVaultSettle
    discountfCash
    allowsReentrancy
    deleverageDisabled
    maxPrimaryBorrowCapacity
    totalUsedPrimaryBorrowCapacity
    maxSecondaryBorrowCapacity
    totalUsedSecondaryBorrowCapacity
    minAccountSecondaryBorrow
  }
  whitelistedContracts {
    id
    name
    capability
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllConfigurationByBlockDocument = (0, utils_1.gql) `
    query AllConfigurationByBlock($blockNumber: Int) {
  currencyConfigurations(block: {number: $blockNumber}) {
    id
    underlying {
      id
    }
    pCash {
      id
    }
    pDebt {
      id
    }
    maxUnderlyingSupply
    collateralHaircut
    debtBuffer
    liquidationDiscount
    primeCashRateOracleTimeWindowSeconds
    primeCashHoldingsOracle
    primeCashCurve {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    primeDebtAllowed
    fCashRateOracleTimeWindowSeconds
    fCashReserveFeeSharePercent
    fCashDebtBufferBasisPoints
    fCashHaircutBasisPoints
    fCashMinOracleRate
    fCashMaxOracleRate
    fCashMaxDiscountFactor
    fCashLiquidationHaircutBasisPoints
    fCashLiquidationDebtBufferBasisPoints
    fCashActiveCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    fCashNextCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    treasuryReserveBuffer
    primeCashHoldings
    depositShares
    leverageThresholds
    proportions
    residualPurchaseIncentiveBasisPoints
    residualPurchaseTimeBufferSeconds
    cashWithholdingBufferBasisPoints
    pvHaircutPercentage
    liquidationHaircutPercentage
    incentives {
      incentiveEmissionRate
      accumulatedNOTEPerNToken
      lastAccumulatedTime
      currentSecondaryReward {
        id
        symbol
      }
      secondaryIncentiveRewarder
      secondaryEmissionRate
      accumulatedSecondaryRewardPerNToken
      lastSecondaryAccumulatedTime
      secondaryRewardEndTime
    }
  }
  vaultConfigurations(where: {enabled: true}, block: {number: $blockNumber}) {
    id
    vaultAddress
    strategy
    name
    primaryBorrowCurrency {
      id
    }
    minAccountBorrowSize
    minCollateralRatioBasisPoints
    maxDeleverageCollateralRatioBasisPoints
    feeRateBasisPoints
    reserveFeeSharePercent
    liquidationRatePercent
    maxBorrowMarketIndex
    secondaryBorrowCurrencies {
      id
    }
    maxRequiredAccountCollateralRatioBasisPoints
    enabled
    allowRollPosition
    onlyVaultEntry
    onlyVaultExit
    onlyVaultRoll
    onlyVaultDeleverage
    onlyVaultSettle
    discountfCash
    allowsReentrancy
    deleverageDisabled
    maxPrimaryBorrowCapacity
    totalUsedPrimaryBorrowCapacity
    maxSecondaryBorrowCapacity
    totalUsedSecondaryBorrowCapacity
    minAccountSecondaryBorrow
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllOraclesDocument = (0, utils_1.gql) `
    query AllOracles($skip: Int!) {
  oracles(
    where: {oracleType_in: [Chainlink, fCashOracleRate, fCashSettlementRate, PrimeCashToUnderlyingExchangeRate, PrimeDebtToUnderlyingExchangeRate, VaultShareOracleRate, nTokenToUnderlyingExchangeRate, fCashSpotRate], matured: false}
    first: 1000
    skip: $skip
  ) {
    id
    lastUpdateBlockNumber
    lastUpdateTimestamp
    base {
      id
      decimals
    }
    quote {
      id
      currencyId
    }
    decimals
    oracleAddress
    oracleType
    mustInvert
    latestRate
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllOraclesByBlockDocument = (0, utils_1.gql) `
    query AllOraclesByBlock($blockNumber: Int) {
  oracles(
    where: {oracleType_in: [Chainlink, fCashOracleRate, fCashSettlementRate, PrimeCashToUnderlyingExchangeRate, PrimeDebtToUnderlyingExchangeRate, VaultShareOracleRate, nTokenToUnderlyingExchangeRate, PrimeCashPremiumInterestRate, PrimeDebtPremiumInterestRate, PrimeCashExternalLendingInterestRate, fCashSpotRate, PrimeCashToUnderlyingOracleInterestRate, fCashToUnderlyingExchangeRate], matured: false}
    first: 1000
    block: {number: $blockNumber}
  ) {
    id
    lastUpdateBlockNumber
    lastUpdateTimestamp
    base {
      id
      decimals
    }
    quote {
      id
      currencyId
    }
    decimals
    oracleAddress
    oracleType
    mustInvert
    latestRate
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllTokensDocument = (0, utils_1.gql) `
    query AllTokens {
  tokens(first: 1000) {
    id
    tokenType
    tokenInterface
    underlying {
      id
    }
    currencyId
    name
    symbol
    decimals
    totalSupply
    hasTransferFee
    isfCashDebt
    maturity
    vaultAddress
    tokenAddress
    totalSupply
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllTokensByBlockDocument = (0, utils_1.gql) `
    query AllTokensByBlock($blockNumber: Int) {
  tokens(first: 1000, block: {number: $blockNumber}) {
    id
    tokenType
    tokenInterface
    underlying {
      id
    }
    currencyId
    name
    symbol
    decimals
    totalSupply
    hasTransferFee
    isfCashDebt
    maturity
    vaultAddress
    tokenAddress
    totalSupply
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllVaultAccountsDocument = (0, utils_1.gql) `
    query AllVaultAccounts($blockNumber: Int!, $vaultAddress: Bytes!, $skip: Int) {
  balances(
    where: {token_: {vaultAddress: $vaultAddress, tokenType: VaultShare}}
    block: {number: $blockNumber}
    first: 1000
    skip: $skip
  ) {
    id
    account {
      id
    }
    current {
      currentBalance
    }
  }
}
    `;
exports.AllVaultsDocument = (0, utils_1.gql) `
    query AllVaults($skip: Int) {
  vaultConfigurations(first: 1000, skip: $skip) {
    id
    vaultAddress
    strategy
    name
    enabled
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.AllVaultsByBlockDocument = (0, utils_1.gql) `
    query AllVaultsByBlock($blockNumber: Int, $skip: Int) {
  vaultConfigurations(
    where: {enabled: true}
    block: {number: $blockNumber}
    first: 1000
    skip: $skip
  ) {
    id
    vaultAddress
    strategy
    name
    enabled
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.ExchangeRateValuesDocument = (0, utils_1.gql) `
    query ExchangeRateValues($skip: Int, $oracleId: String, $minTimestamp: Int) {
  exchangeRates(
    where: {oracle: $oracleId, timestamp_gt: $minTimestamp}
    first: 1000
    skip: $skip
    orderBy: timestamp
    orderDirection: desc
  ) {
    timestamp
    rate
  }
}
    `;
exports.ExternalLendingHistoryDocument = (0, utils_1.gql) `
    query ExternalLendingHistory {
  externalLendings {
    id
    underlying {
      id
    }
    underlyingSnapshots(orderBy: timestamp, orderDirection: desc, first: 10) {
      timestamp
      balanceOf
      storedBalanceOf
    }
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.HistoricalOracleValuesDocument = (0, utils_1.gql) `
    query HistoricalOracleValues($skip: Int, $minTimestamp: Int) {
  oracles(
    where: {oracleType_in: [Chainlink, fCashSettlementRate, nTokenToUnderlyingExchangeRate, PrimeCashToUnderlyingExchangeRate, PrimeDebtToUnderlyingExchangeRate, VaultShareOracleRate, fCashOracleRate, PrimeCashPremiumInterestRate, PrimeDebtPremiumInterestRate, nTokenBlendedInterestRate, nTokenFeeRate, nTokenIncentiveRate, nTokenSecondaryIncentiveRate], matured: false}
    first: 1000
    skip: $skip
  ) {
    id
    base {
      id
    }
    quote {
      id
    }
    lastUpdateTimestamp
    lastUpdateBlockNumber
    oracleAddress
    decimals
    ratePrecision
    oracleType
    latestRate
    historicalRates(
      where: {timestamp_gt: $minTimestamp}
      orderBy: timestamp
      orderDirection: desc
      first: 500
    ) {
      totalSupply
      blockNumber
      timestamp
      rate
    }
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.HistoricalTradingActivityDocument = (0, utils_1.gql) `
    query HistoricalTradingActivity($skip: Int, $minTimestamp: Int) {
  tradingActivity: transferBundles(
    where: {bundleName_in: ["Buy fCash", "Buy fCash Vault", "Sell fCash", "Sell fCash Vault"], timestamp_gt: $minTimestamp}
    orderBy: timestamp
    orderDirection: desc
    first: 1000
    skip: $skip
  ) {
    id
    bundleName
    blockNumber
    timestamp
    transactionHash {
      id
    }
    transfers {
      to {
        id
      }
      toSystemAccount
      from {
        id
      }
      fromSystemAccount
      value
      valueInUnderlying
      token {
        id
        currencyId
      }
    }
  }
  _meta {
    block {
      number
    }
  }
}
    `;
exports.MetaDocument = (0, utils_1.gql) `
    query Meta {
  _meta {
    block {
      number
      hash
      timestamp
    }
    deployment
    hasIndexingErrors
  }
}
    `;
exports.NetworkTransactionHistoryDocument = (0, utils_1.gql) `
    query NetworkTransactionHistory($skip: Int!) {
  transactions(orderBy: timestamp, orderDirection: desc, skip: $skip, first: 100) {
    timestamp
    blockNumber
    transactionHash
    profitLossLineItems(where: {isTransientLineItem: false}) {
      account {
        id
      }
      timestamp
      blockNumber
      transactionHash {
        id
      }
      token {
        id
        tokenType
      }
      underlyingToken {
        id
      }
      tokenAmount
      bundle {
        bundleName
      }
      underlyingAmountRealized
      underlyingAmountSpot
      realizedPrice
      spotPrice
      impliedFixedRate
      isTransientLineItem
    }
  }
}
    `;
exports.VaultReinvestmentDocument = (0, utils_1.gql) `
    query VaultReinvestment($skip: Int, $minTimestamp: Int) {
  reinvestments(
    orderBy: timestamp
    orderDirection: desc
    first: 1000
    skip: $skip
    where: {timestamp_gt: $minTimestamp}
  ) {
    timestamp
    blockNumber
    transactionHash
    vault {
      id
    }
    rewardTokenSold {
      id
    }
    rewardAmountSold
    tokensReinvested
    tokensPerVaultShare
    underlyingAmountRealized
    vaultSharePrice
  }
  _meta {
    block {
      number
    }
  }
}
    `;
function getSdk(requester) {
    return {
        AccountBalanceStatement(variables, options) {
            return requester(exports.AccountBalanceStatementDocument, variables, options);
        },
        AccountHoldingsHistorical(variables, options) {
            return requester(exports.AccountHoldingsHistoricalDocument, variables, options);
        },
        AccountTransactionHistory(variables, options) {
            return requester(exports.AccountTransactionHistoryDocument, variables, options);
        },
        ActiveAccounts(variables, options) {
            return requester(exports.ActiveAccountsDocument, variables, options);
        },
        AllAccounts(variables, options) {
            return requester(exports.AllAccountsDocument, variables, options);
        },
        AllAccountsByBlock(variables, options) {
            return requester(exports.AllAccountsByBlockDocument, variables, options);
        },
        AllConfiguration(variables, options) {
            return requester(exports.AllConfigurationDocument, variables, options);
        },
        AllConfigurationByBlock(variables, options) {
            return requester(exports.AllConfigurationByBlockDocument, variables, options);
        },
        AllOracles(variables, options) {
            return requester(exports.AllOraclesDocument, variables, options);
        },
        AllOraclesByBlock(variables, options) {
            return requester(exports.AllOraclesByBlockDocument, variables, options);
        },
        AllTokens(variables, options) {
            return requester(exports.AllTokensDocument, variables, options);
        },
        AllTokensByBlock(variables, options) {
            return requester(exports.AllTokensByBlockDocument, variables, options);
        },
        AllVaultAccounts(variables, options) {
            return requester(exports.AllVaultAccountsDocument, variables, options);
        },
        AllVaults(variables, options) {
            return requester(exports.AllVaultsDocument, variables, options);
        },
        AllVaultsByBlock(variables, options) {
            return requester(exports.AllVaultsByBlockDocument, variables, options);
        },
        ExchangeRateValues(variables, options) {
            return requester(exports.ExchangeRateValuesDocument, variables, options);
        },
        ExternalLendingHistory(variables, options) {
            return requester(exports.ExternalLendingHistoryDocument, variables, options);
        },
        HistoricalOracleValues(variables, options) {
            return requester(exports.HistoricalOracleValuesDocument, variables, options);
        },
        HistoricalTradingActivity(variables, options) {
            return requester(exports.HistoricalTradingActivityDocument, variables, options);
        },
        Meta(variables, options) {
            return requester(exports.MetaDocument, variables, options);
        },
        NetworkTransactionHistory(variables, options) {
            return requester(exports.NetworkTransactionHistoryDocument, variables, options);
        },
        VaultReinvestment(variables, options) {
            return requester(exports.VaultReinvestmentDocument, variables, options);
        }
    };
}
//# sourceMappingURL=index.js.map