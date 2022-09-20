import { gql } from '@apollo/client/core';
import { BigNumber } from 'ethers';
import { TokenType } from '../../libs/types';
import GraphClient from '../GraphClient';
import { SerializedContract } from '../encoding/SystemProto';
import TypedBigNumber, { BigNumberType } from '../../libs/TypedBigNumber';
import { SecondaryBorrowArray } from '..';

const systemConfigurationQuery = gql`
  {
    currencies {
      id
      tokenAddress
      tokenType
      decimals
      name
      symbol
      underlyingName
      underlyingSymbol
      underlyingDecimals
      underlyingTokenAddress
      hasTransferFee
      ethExchangeRate {
        rateOracle
        rateDecimalPlaces
        mustInvert
        buffer
        haircut
        liquidationDiscount
      }
      assetExchangeRate {
        rateAdapterAddress
        underlyingDecimalPlaces
      }
      cashGroup {
        maxMarketIndex
        rateOracleTimeWindowSeconds
        totalFeeBasisPoints
        reserveFeeSharePercent
        debtBufferBasisPoints
        fCashHaircutBasisPoints
        liquidityTokenHaircutsPercent
        rateScalars
      }
      nToken {
        tokenAddress
        name
        symbol
        decimals
        depositShares
        leverageThresholds
        incentiveEmissionRate
        pvHaircutPercentage
        liquidationHaircutPercentage
      }
      incentiveMigration {
        migrationEmissionRate
        finalIntegralTotalSupply
        migrationTime
      }
      leveragedVaults {
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
        liquidationRatePercent
        maxBorrowMarketIndex
        secondaryBorrowCurrencies {
          id
          symbol
          underlyingSymbol
        }
        enabled
        allowRollPosition
        onlyVaultEntry
        onlyVaultExit
        onlyVaultRoll
        onlyVaultDeleverage
        onlyVaultSettle
        allowsReentrancy
        vaultCapacity {
          id
          maxPrimaryBorrowCapacity
          maxSecondaryBorrowCapacity
          totalUsedPrimaryBorrowCapacity
          totalUsedSecondaryBorrowCapacity
        }
        maturities {
          id
          lastUpdateBlockNumber
          maturity
          totalPrimaryfCashBorrowed
          totalAssetCash
          totalVaultShares
          totalStrategyTokens
          totalSecondaryfCashBorrowed
          totalSecondaryDebtShares
          isSettled
          settlementTimestamp
          settlementStrategyTokenValue
          settlementSecondaryBorrowfCashSnapshot
          settlementRate {
            rate
          }
          shortfall
          remainingSettledAssetCash
          remainingSettledStrategyTokens
        }
      }
    }
  }
`;

interface SystemQueryResult {
  currencies: {
    id: string;
    tokenAddress: string;
    tokenType: string;
    decimals: string;
    name: string;
    symbol: string;
    underlyingName: string | null;
    underlyingSymbol: string | null;
    underlyingDecimals: string | null;
    underlyingTokenAddress: string | null;
    hasTransferFee: boolean;
    ethExchangeRate: {
      rateOracle: string;
      rateDecimalPlaces: number;
      mustInvert: boolean;
      buffer: number;
      haircut: number;
    };
    assetExchangeRate: {
      rateAdapterAddress: string;
      underlyingDecimalPlaces: number;
    } | null;
    cashGroup: {
      maxMarketIndex: number;
      rateOracleTimeWindowSeconds: number;
      totalFeeBasisPoints: number;
      reserveFeeSharePercent: number;
      debtBufferBasisPoints: number;
      fCashHaircutBasisPoints: number;
      liquidityTokenHaircutsPercent: number[];
      rateScalars: number[];
    } | null;
    nToken: {
      tokenAddress: string;
      name: string;
      symbol: string;
      decimals: string;
      depositShares: number[] | null;
      leverageThresholds: number[] | null;
      incentiveEmissionRate: string | null;
      pvHaircutPercentage: number | null;
    } | null;
    incentiveMigration: {
      migrationEmissionRate: string;
      finalIntegralTotalSupply: string;
      migrationTime: string;
    } | null;
    leveragedVaults: {
      id: string;
      vaultAddress: string;
      strategy: string;
      name: string;
      primaryBorrowCurrency: {
        id: string;
      };
      minAccountBorrowSize: string;
      minCollateralRatioBasisPoints: number;
      maxDeleverageCollateralRatioBasisPoints: number;
      feeRateBasisPoints: number;
      liquidationRatePercent: number;
      maxBorrowMarketIndex: number;
      secondaryBorrowCurrencies: {
        id: string;
        symbol: string;
        underlyingSymbol: string | null;
      }[];
      enabled: boolean;
      allowRollPosition: boolean;
      onlyVaultEntry: boolean;
      onlyVaultExit: boolean;
      onlyVaultRoll: boolean;
      onlyVaultDeleverage: boolean;
      onlyVaultSettle: boolean;
      allowsReentrancy: boolean;
      vaultCapacity: {
        id: string;
        maxPrimaryBorrowCapacity: string;
        totalUsedPrimaryBorrowCapacity: string;
        maxSecondaryBorrowCapacity: [string, string] | null;
        totalUsedSecondaryBorrowCapacity: [string, string] | null;
      };
      maturities: {
        id: string;
        maturity: number;
        totalPrimaryfCashBorrowed: string;
        totalAssetCash: string;
        totalVaultShares: string;
        totalStrategyTokens: string;
        totalSecondaryfCashBorrowed: [string, string] | null;
        totalSecondaryDebtShares: [string, string] | null;
        isSettled: boolean;
        settlementTimestamp: number | null;
        settlementStrategyTokenValue: string | null;
        settlementSecondaryBorrowfCashSnapshot: [string, string] | null;
        settlementSecondaryBorrowExchangeRate: [string, string] | null;
        shortfall: string | null;
        settlementRate: {
          rate: string;
        } | null;
        remainingSettledAssetCash: string | null;
        remainingSettledStrategyTokens: string | null;
      }[];
    }[];
  }[];
}

export interface CurrencyConfig {
  id: number;
  assetName: string;
  assetSymbol: string;
  assetContract: SerializedContract;
  assetDecimals: BigNumber;
  assetDecimalPlaces: number;
  tokenType: TokenType;
  underlyingName: string | undefined;
  underlyingSymbol: string | undefined;
  underlyingDecimalPlaces: number | undefined;
  underlyingContract: SerializedContract | undefined;
  hasTransferFee: boolean;
  nTokenSymbol: string | null;
  ethExchangeRate: {
    rateOracle: SerializedContract;
    rateDecimalPlaces: number;
    mustInvert: boolean;
    buffer: number;
    haircut: number;
  };
  assetExchangeRate: {
    rateAdapter: SerializedContract;
    underlyingDecimalPlaces: number;
  } | null;
  cashGroup: {
    maxMarketIndex: number;
    rateOracleTimeWindowSeconds: number;
    totalFeeBasisPoints: number;
    reserveFeeSharePercent: number;
    debtBufferBasisPoints: number;
    fCashHaircutBasisPoints: number;
    liquidityTokenHaircutsPercent: number[];
    rateScalars: number[];
  } | null;
  nToken: {
    contract: SerializedContract;
    name: string;
    nTokenSymbol: string;
    depositShares: number[] | undefined;
    leverageThresholds: number[] | undefined;
    incentiveEmissionRate: BigNumber | undefined;
    pvHaircutPercentage: number | undefined;
  } | null;
  incentiveMigration: {
    migratedEmissionRate: BigNumber;
    integralTotalSupply: BigNumber;
    migrationTime: number;
  } | null;
  leveragedVaults: {
    id: string;
    vaultAddress: string;
    strategy: string;
    name: string;
    primaryBorrowCurrency: number;
    minAccountBorrowSize: TypedBigNumber;
    minCollateralRatioBasisPoints: number;
    maxDeleverageCollateralRatioBasisPoints: number;
    feeRateBasisPoints: number;
    liquidationRatePercent: number;
    maxBorrowMarketIndex: number;
    secondaryBorrowCurrencies: [number, number] | undefined;
    enabled: boolean;
    allowRollPosition: boolean;
    onlyVaultEntry: boolean;
    onlyVaultExit: boolean;
    onlyVaultRoll: boolean;
    onlyVaultDeleverage: boolean;
    onlyVaultSettle: boolean;
    allowsReentrancy: boolean;
    maxPrimaryBorrowCapacity: TypedBigNumber;
    totalUsedPrimaryBorrowCapacity: TypedBigNumber;
    maxSecondaryBorrowCapacity: SecondaryBorrowArray;
    totalUsedSecondaryBorrowCapacity: SecondaryBorrowArray;
    vaultStates: {
      maturity: number;
      totalPrimaryfCashBorrowed: TypedBigNumber;
      totalAssetCash: TypedBigNumber;
      totalVaultShares: TypedBigNumber;
      totalStrategyTokens: TypedBigNumber;
      totalSecondaryfCashBorrowed: SecondaryBorrowArray;
      totalSecondaryDebtShares: SecondaryBorrowArray;
      isSettled: boolean;
      settlementTimestamp: number | undefined;
      settlementStrategyTokenValue: TypedBigNumber | undefined;
      settlementSecondaryBorrowfCashSnapshot: SecondaryBorrowArray;
      settlementRate: BigNumber | undefined;
      shortfall: TypedBigNumber | undefined;
      remainingSettledAssetCash: TypedBigNumber | undefined;
      remainingSettledStrategyTokens: TypedBigNumber | undefined;
    }[];
  }[];
}

function mapSecondaryBorrowCurrencies(s?: { id: string; symbol: string; underlyingSymbol: string | null }[]) {
  if (!s || s.length === 0) return undefined;
  if (s.length === 1) return [Number(s[0].id), 0];
  if (s.length === 2) return [Number(s[0].id), Number(s[1].id)];
  return undefined;
}

function mapSecondarySymbols(
  s?: { id: string; symbol: string; underlyingSymbol: string | null }[]
): [string | undefined, string | undefined] | undefined {
  if (!s || s.length === 0) return undefined;
  if (s.length === 1) return [s[0].underlyingSymbol || s[0].symbol, undefined];
  if (s.length === 2) return [s[0].underlyingSymbol || s[0].symbol, s[1].underlyingSymbol || s[1].symbol];
  return undefined;
}

function mapSecondaryTypedBigNumber(
  v: [string, string] | null,
  c: [string | undefined, string | undefined] | undefined
) {
  if (!v) return undefined;
  if (!c) return undefined;
  if (c[0] !== undefined && c[1] === undefined) {
    return [TypedBigNumber.from(v[0], BigNumberType.InternalUnderlying, c[0]).toJSON()];
  }
  if (c[0] !== undefined && c[1] !== undefined) {
    return [
      TypedBigNumber.from(v[0], BigNumberType.InternalUnderlying, c[0]).toJSON(),
      TypedBigNumber.from(v[1], BigNumberType.InternalUnderlying, c[1]).toJSON(),
    ];
  }
  return undefined;
}

function mapSecondaryDebtShares(
  v: [string, string] | null,
  c: [string | undefined, string | undefined] | undefined,
  vaultSymbol: string
) {
  if (!v) return undefined;
  if (!c) return undefined;
  if (c[0] !== undefined && c[1] === undefined) {
    return [TypedBigNumber.from(v[0], BigNumberType.DebtShare, `${vaultSymbol}:${c[0]}`).toJSON()];
  }
  if (c[0] !== undefined && c[1] !== undefined) {
    return [
      TypedBigNumber.from(v[0], BigNumberType.DebtShare, `${vaultSymbol}:${c[0]}`).toJSON(),
      TypedBigNumber.from(v[1], BigNumberType.DebtShare, `${vaultSymbol}:${c[1]}`).toJSON(),
    ];
  }
  return undefined;
}

function underlyingSymbol(c: any): string {
  return c.underlyingSymbol || c.symbol;
}

export async function getSystemConfig(graphClient: GraphClient): Promise<CurrencyConfig[]> {
  const data = await graphClient.queryOrThrow<SystemQueryResult>(systemConfigurationQuery);
  return data.currencies
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(
      (c) =>
        ({
          ...c,
          id: Number(c.id),
          assetName: c.name,
          assetSymbol: c.symbol,
          assetDecimals: BigNumber.from(c.decimals),
          assetDecimalPlaces: Math.log10(Number(c.decimals)),
          assetContract: {
            _isSerializedContract: true,
            _address: c.tokenAddress,
            _abiName: 'ERC20',
          },
          tokenType: c.tokenType as TokenType,
          underlyingName: c.underlyingName ?? undefined,
          underlyingSymbol: c.underlyingSymbol ?? undefined,
          underlyingDecimals: c.underlyingDecimals ? BigNumber.from(c.underlyingDecimals) : undefined,
          underlyingDecimalPlaces: Math.log10(Number(c.underlyingDecimals ?? 1)),
          underlyingContract: c.underlyingTokenAddress
            ? {
                _isSerializedContract: true,
                _address: c.underlyingTokenAddress,
                _abiName: 'ERC20',
              }
            : {
                _isSerializedContract: false,
              },
          nTokenSymbol: c.nToken?.symbol ?? undefined,
          nToken: c.nToken?.symbol
            ? {
                ...c.nToken,
                contract: {
                  _isSerializedContract: true,
                  _address: c.nToken?.tokenAddress,
                  _abiName: 'nTokenERC20',
                },
                nTokenSymbol: c.nToken?.symbol,
                incentiveEmissionRate: BigNumber.from(c.nToken?.incentiveEmissionRate || 0),
              }
            : undefined,
          incentiveMigration: c.incentiveMigration
            ? {
                migratedEmissionRate: BigNumber.from(c.incentiveMigration.migrationEmissionRate),
                integralTotalSupply: BigNumber.from(c.incentiveMigration.finalIntegralTotalSupply),
                migrationTime: BigNumber.from(c.incentiveMigration.migrationTime).toNumber(),
              }
            : undefined,
          ethExchangeRate: {
            ...c.ethExchangeRate,
            rateOracle: {
              _isSerializedContract: true,
              _address: c.ethExchangeRate.rateOracle,
              _abiName: 'IAggregator',
            },
          },
          assetExchangeRate: c.assetExchangeRate
            ? {
                ...c.assetExchangeRate,
                rateAdapter: {
                  _isSerializedContract: true,
                  _address: c.assetExchangeRate?.rateAdapterAddress,
                  _abiName: 'AssetRateAggregator',
                },
              }
            : undefined,
          leveragedVaults: c.leveragedVaults.map((v) => {
            const symbol = underlyingSymbol(c);
            const secondarySymbols = mapSecondarySymbols(v.secondaryBorrowCurrencies);

            return {
              ...v,
              primaryBorrowCurrency: Number(v.primaryBorrowCurrency.id),
              minAccountBorrowSize: TypedBigNumber.from(
                v.minAccountBorrowSize,
                BigNumberType.InternalUnderlying,
                symbol
              ).toJSON(),
              maxPrimaryBorrowCapacity: TypedBigNumber.from(
                v.vaultCapacity.maxPrimaryBorrowCapacity,
                BigNumberType.InternalUnderlying,
                symbol
              ).toJSON(),
              totalUsedPrimaryBorrowCapacity: TypedBigNumber.from(
                v.vaultCapacity.totalUsedPrimaryBorrowCapacity,
                BigNumberType.InternalUnderlying,
                symbol
              ).toJSON(),
              secondaryBorrowCurrencies: mapSecondaryBorrowCurrencies(v.secondaryBorrowCurrencies),
              maxSecondaryBorrowCapacity: mapSecondaryTypedBigNumber(
                v.vaultCapacity.maxSecondaryBorrowCapacity,
                secondarySymbols
              ),
              totalUsedSecondaryBorrowCapacity: mapSecondaryTypedBigNumber(
                v.vaultCapacity.totalUsedSecondaryBorrowCapacity,
                secondarySymbols
              ),
              vaultStates: v.maturities.map((m) => {
                const assetSymbol = c.symbol;
                const vaultSymbol = `${v.vaultAddress}:${m.maturity}`;
                return {
                  ...m,
                  totalPrimaryfCashBorrowed: TypedBigNumber.from(
                    m.totalPrimaryfCashBorrowed,
                    BigNumberType.InternalUnderlying,
                    symbol
                  ).toJSON(),
                  totalSecondaryfCashBorrowed: mapSecondaryTypedBigNumber(
                    m.totalSecondaryfCashBorrowed,
                    secondarySymbols
                  ),
                  totalSecondaryDebtShares: mapSecondaryDebtShares(
                    m.totalSecondaryDebtShares,
                    secondarySymbols,
                    vaultSymbol
                  ),
                  totalAssetCash: TypedBigNumber.from(
                    m.totalAssetCash,
                    BigNumberType.InternalAsset,
                    assetSymbol
                  ).toJSON(),
                  totalVaultShares: TypedBigNumber.from(
                    m.totalVaultShares,
                    BigNumberType.VaultShare,
                    vaultSymbol
                  ).toJSON(),
                  totalStrategyTokens: TypedBigNumber.from(
                    m.totalStrategyTokens,
                    BigNumberType.StrategyToken,
                    vaultSymbol
                  ).toJSON(),
                  settlementStrategyTokenValue: m.settlementStrategyTokenValue
                    ? TypedBigNumber.from(
                        m.settlementStrategyTokenValue,
                        BigNumberType.InternalUnderlying,
                        symbol
                      ).toJSON()
                    : undefined,
                  settlementSecondaryBorrowfCashSnapshot: mapSecondaryTypedBigNumber(
                    m.settlementSecondaryBorrowfCashSnapshot,
                    // Secondary borrow fCash snapshots are in underlying
                    secondarySymbols?.map((s) => (s ? symbol : undefined)) as
                      | [string | undefined, string | undefined]
                      | undefined
                  ),
                  settlementRate: m.settlementRate?.rate ? BigNumber.from(m.settlementRate.rate) : undefined,
                  shortfall: m.shortfall
                    ? TypedBigNumber.from(m.shortfall, BigNumberType.InternalAsset, assetSymbol).toJSON()
                    : undefined,
                  remainingSettledAssetCash: m.remainingSettledAssetCash
                    ? TypedBigNumber.from(
                        m.remainingSettledAssetCash,
                        BigNumberType.InternalAsset,
                        assetSymbol
                      ).toJSON()
                    : undefined,
                  remainingSettledStrategyTokens: m.remainingSettledStrategyTokens
                    ? TypedBigNumber.from(
                        m.remainingSettledStrategyTokens,
                        BigNumberType.StrategyToken,
                        vaultSymbol
                      ).toJSON()
                    : undefined,
                };
              }),
            };
          }),
        } as CurrencyConfig)
    );
}
