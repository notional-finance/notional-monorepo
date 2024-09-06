import { TokenBalance } from '../../token-balance';
import { NetworkModel } from '../NetworkModel';
import {
  getNowSeconds,
  INTERNAL_TOKEN_PRECISION,
  leveragedYield,
  PORTFOLIO_STATE_ZERO_OPTIONS,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SCALAR_PRECISION,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { assertDefined, ConfigurationViews } from './ConfigurationViews';
import { TokenDefinition } from '../../Definitions';
import { Instance } from 'mobx-state-tree';
import { TokenViews } from './TokenViews';
import { VaultViews } from './VaultViews';
import { ExchangeViews } from './ExchangeViews';

export interface APYData {
  totalAPY: number;
  organicAPY?: number;
  feeAPY?: number;
  incentives?: {
    symbol: string;
    incentiveAPY: number;
  }[];
  utilization?: number;
  pointMultiples?: Record<string, number>;
  leverageRatio?: number;
  debtAPY?: number;
}

type ProductGroupItem = {
  token: TokenDefinition;
  apy: APYData;
  tvl: TokenBalance;
  liquidity: TokenBalance;
  underlying?: TokenDefinition;
  collateralFactor: string;
};
export type ProductGroupData = ProductGroupItem[][];

export const YieldViews = (self: Instance<typeof NetworkModel>) => {
  const {
    getTokenBySymbol,
    getTokenByID,
    getPrimeCash,
    getUnderlying,
    getDebtTokens,
    getVaultShares,
    getVaultDebt,
    unwrapVaultToken,
  } = TokenViews(self);
  const { getVaultAdapter, getVaultConfig } = VaultViews(self);
  const { getConfig } = ConfigurationViews(self);
  const { getfCashMarket, getNotionalMarket } = ExchangeViews(self);

  const convertRatioToYield = (num: TokenBalance, denom: TokenBalance) => {
    if (num.isZero()) return 0;

    return (
      (num.toToken(denom.token).ratioWith(denom).toNumber() * 100) /
      RATE_PRECISION
    );
  };

  const getAnnualizedNOTEIncentives = (nToken: TokenDefinition) => {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = getConfig(nToken.currencyId);
    const NOTE = getTokenBySymbol('NOTE');

    const incentiveEmissionRate = TokenBalance.from(
      BigNumber.from(
        (config.incentives?.incentiveEmissionRate as string | undefined) || 0
      ).mul(INTERNAL_TOKEN_PRECISION),
      NOTE
    );

    const accumulatedNOTEPerNToken = config.incentives?.accumulatedNOTEPerNToken
      ? // NOTE: this value is stored in 18 decimals natively, but downscale it here
        // for calculations
        TokenBalance.from(
          config.incentives.accumulatedNOTEPerNToken,
          NOTE
        ).scale(INTERNAL_TOKEN_PRECISION, SCALAR_PRECISION)
      : undefined;

    const lastAccumulatedTime = config.incentives?.lastAccumulatedTime
      ? parseInt(config.incentives.lastAccumulatedTime)
      : undefined;

    return {
      incentiveEmissionRate,
      lastAccumulatedTime,
      accumulatedNOTEPerNToken,
    };
  };

  const getAnnualizedSecondaryIncentives = (nToken: TokenDefinition) => {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = getConfig(nToken.currencyId);
    if (!config?.incentives?.currentSecondaryReward) return undefined;
    const rewardEndTime = config?.incentives?.secondaryRewardEndTime
      ? parseInt(config.incentives.secondaryRewardEndTime)
      : undefined;
    if (rewardEndTime && rewardEndTime < getNowSeconds()) return undefined;

    const rewardToken = getTokenByID(
      config.incentives.currentSecondaryReward.id
    );

    const incentiveEmissionRate = TokenBalance.fromFloat(
      BigNumber.from(
        (config.incentives.secondaryEmissionRate as string | undefined) || 0
      ).toNumber() / INTERNAL_TOKEN_PRECISION,
      rewardToken
    );
    const accumulatedRewardPerNToken = config.incentives
      ?.accumulatedSecondaryRewardPerNToken
      ? TokenBalance.from(
          // This value is stored in 18 decimals but we want to scale it to reward token precision
          BigNumber.from(config.incentives.accumulatedSecondaryRewardPerNToken)
            .mul(TokenBalance.unit(rewardToken).precision)
            .div(SCALAR_PRECISION),
          rewardToken
        )
      : undefined;

    return {
      rewardToken,
      incentiveEmissionRate,
      accumulatedRewardPerNToken,
      lastAccumulatedTime: config.incentives?.lastSecondaryAccumulatedTime
        ? parseInt(config.incentives.lastSecondaryAccumulatedTime)
        : undefined,
      rewardEndTime,
    };
  };

  const getTVL = (token: TokenDefinition) => {
    if (token.tokenType === 'fCash' && token.currencyId) {
      const market = getfCashMarket(token.currencyId);
      const marketIndex = market.getMarketIndex(token.maturity);
      const pCash = market.poolParams.perMarketCash[marketIndex - 1];
      const fCash = market.poolParams.perMarketfCash[marketIndex - 1];
      return fCash.toUnderlying().add(pCash.toUnderlying());
    } else if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      const adapter = getVaultAdapter(token.vaultAddress);
      // NOTE: this returns the TVL of the vault across all maturities
      return adapter.getVaultTVL();
    }

    return token.totalSupply?.toUnderlying() || TokenBalance.zero(token);
  };

  const getLiquidity = (token: TokenDefinition) => {
    if (token.tokenType === 'PrimeDebt') {
      // Liquidity for prime debt is based on prime cash supply
      return getTVL(getPrimeCash(token.currencyId));
    }

    return getTVL(token);
  };

  const getIncentiveAPY = (token: TokenDefinition, tvl: TokenBalance) => {
    const incentives: { symbol: string; incentiveAPY: number }[] = [];
    const { incentiveEmissionRate: annualizedNOTEIncentives } =
      getAnnualizedNOTEIncentives(token);

    if (annualizedNOTEIncentives.isPositive()) {
      incentives.push({
        symbol: 'NOTE',
        incentiveAPY: convertRatioToYield(annualizedNOTEIncentives, tvl),
      });
    }
    const secondaryIncentives = getAnnualizedSecondaryIncentives(token);
    if (secondaryIncentives) {
      incentives.push({
        symbol: secondaryIncentives.incentiveEmissionRate.symbol,
        incentiveAPY: convertRatioToYield(
          secondaryIncentives.incentiveEmissionRate,
          tvl
        ),
      });
    }

    return incentives;
  };

  const getSpotAPY = (tokenId: string) => {
    const apyData: APYData = { totalAPY: 0 };

    const _token = getTokenByID(tokenId);
    const token = unwrapVaultToken(_token);
    if (!token.currencyId) throw Error('Token currencyId not found');

    if (
      token.tokenType === 'PrimeCash' ||
      token.tokenType === 'PrimeDebt' ||
      token.tokenType === 'fCash'
    ) {
      const market = getNotionalMarket(token.currencyId);
      apyData.organicAPY = market.getSpotInterestRate(token) || 0;
      if (
        _token.tokenType === 'VaultDebt' &&
        _token.maturity === PRIME_CASH_VAULT_MATURITY &&
        _token.vaultAddress
      ) {
        // Add the debt fee to the organic APY
        const config = getVaultConfig(_token.vaultAddress);
        apyData.organicAPY +=
          (config.feeRateBasisPoints * 100) / RATE_PRECISION;
      }
      apyData.totalAPY = apyData.organicAPY;
    } else if (token.tokenType === 'nToken') {
      const market = getfCashMarket(token.currencyId);
      apyData.organicAPY = market.getNTokenBlendedYield();
      const feeRate = self.oracles.get(
        `${token.underlying}:${token.id}:nTokenFeeRate`
      );
      if (feeRate) {
        apyData.feeAPY =
          (feeRate.latestRate?.rate?.toNumber() || 0 * 100) / RATE_PRECISION;

        apyData.organicAPY += apyData.feeAPY;
      }
      const tvl = getTVL(token);
      apyData.incentives = getIncentiveAPY(token, tvl);
      apyData.totalAPY =
        apyData.organicAPY +
        apyData.incentives.reduce((acc, curr) => acc + curr.incentiveAPY, 0);
    } else if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      const adapter = getVaultAdapter(token.vaultAddress);
      apyData.organicAPY = adapter.getVaultAPY();
      apyData.totalAPY = apyData.organicAPY;
      apyData.pointMultiples = adapter.getPointMultiples();
    }

    return apyData;
  };

  const getLeverageRatios = (token: TokenDefinition) => {
    if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      const config = getVaultConfig(token.vaultAddress);
      const minLeverageRatio =
        RATE_PRECISION /
        (config.maxRequiredAccountCollateralRatioBasisPoints as number);
      const defaultLeverageRatio =
        RATE_PRECISION / config.maxDeleverageCollateralRatioBasisPoints;
      const maxLeverageRatio =
        RATE_PRECISION / config.minCollateralRatioBasisPoints;

      return { minLeverageRatio, defaultLeverageRatio, maxLeverageRatio };
    } else if (token.tokenType === 'nToken') {
      if (!token.currencyId) throw Error('Invalid nToken');
      // NOTE: this would include the fCash discount
      // const pvFactor =
      //   debt.token.tokenType === 'fCash'
      //     ? TokenBalance.unit(debt.token).toUnderlying().scaleTo(RATE_DECIMALS)
      //     : RATE_PRECISION;
      const config = getConfig(token.currencyId);
      const nTokenHaircut =
        (assertDefined(config.pvHaircutPercentage) * RATE_PRECISION) / 100;
      const pvFactor = RATE_PRECISION;
      const maxFactor = BigNumber.from(RATE_PRECISION)
        .pow(2)
        .sub(BigNumber.from(pvFactor).mul(nTokenHaircut));
      const maxFactorInverted = BigNumber.from(RATE_PRECISION)
        .pow(3)
        .div(maxFactor)
        .toNumber();
      const maxLeverageRatio = maxFactorInverted / RATE_PRECISION - 1;
      const defaultLeverageRatio = maxLeverageRatio * 0.6;
      return { minLeverageRatio: 0, defaultLeverageRatio, maxLeverageRatio };
    }

    throw Error('Invalid token');
  };

  const getSimulatedAPY = (netAmount: TokenBalance) => {
    const apyData: APYData = { totalAPY: 0 };

    if (netAmount.unwrapVaultToken().tokenType === 'fCash') {
      const market = getfCashMarket(netAmount.currencyId);
      const realized = market.calculateTokenTrade(
        netAmount.unwrapVaultToken(),
        0
      ).tokensOut;
      // We net off the fee for fcash so that we show it as an up-front
      // trading fee rather than part of the implied yield
      apyData.organicAPY =
        market.getImpliedInterestRate(realized, netAmount) || 0;
      apyData.totalAPY = apyData.organicAPY;
    } else if (netAmount.unwrapVaultToken().tokenType === 'PrimeCash') {
      // Increases or decreases the prime supply accordingly
      const market = getNotionalMarket(netAmount.currencyId);
      apyData.utilization = market.getPrimeCashUtilization(
        netAmount.unwrapVaultToken(),
        undefined
      );
      apyData.organicAPY = market.getPrimeSupplyRate(apyData.utilization) || 0;
      apyData.totalAPY = apyData.organicAPY;
    } else if (netAmount.unwrapVaultToken().tokenType === 'PrimeDebt') {
      // If borrowing and withdrawing then it is just prime debt increase. This
      // includes vault debt
      const market = getNotionalMarket(netAmount.currencyId);
      apyData.utilization = market.getPrimeCashUtilization(
        undefined,
        netAmount.unwrapVaultToken().neg()
      );
      apyData.organicAPY = market.getPrimeDebtRate(apyData.utilization) || 0;
      if (
        netAmount.token.tokenType === 'VaultDebt' &&
        netAmount.maturity === PRIME_CASH_VAULT_MATURITY &&
        netAmount.vaultAddress
      ) {
        // Add the debt fee to the organic APY
        const config = getVaultConfig(netAmount.vaultAddress);
        apyData.organicAPY +=
          (config.feeRateBasisPoints * 100) / RATE_PRECISION;
      }
      apyData.totalAPY = apyData.organicAPY;
    } else if (netAmount.tokenType === 'nToken') {
      const market = getfCashMarket(netAmount.currencyId);
      apyData.organicAPY = market.getNTokenBlendedYield(netAmount);
      // TODO: maybe add it to the oracle views and add this to the organicAPY
      apyData.feeAPY = 0;

      const simulatedTVL = getTVL(netAmount.token).add(
        netAmount.toUnderlying()
      );
      // The additional TVL will dilute the incentives
      apyData.incentives = getIncentiveAPY(netAmount.token, simulatedTVL);
      apyData.totalAPY =
        apyData.organicAPY +
        apyData.feeAPY +
        apyData.incentives.reduce((acc, curr) => acc + curr.incentiveAPY, 0);
    } else if (netAmount.tokenType === 'VaultShare' && netAmount.vaultAddress) {
      // No dilution is applied to vault share APY at this point, we may want to add
      // that in the future.
      return getSpotAPY(netAmount.token.id);
    }

    return apyData;
  };

  const getLeveragedAPY = (
    collateralAmount: TokenBalance,
    debtAmount: TokenBalance,
    leverageRatio: number
  ) => {
    const collateralAPY = getSimulatedAPY(collateralAmount);
    const debtAPY = getSimulatedAPY(debtAmount);

    return {
      totalAPY: leveragedYield(
        collateralAPY.totalAPY,
        debtAPY.totalAPY,
        leverageRatio
      ),
      organicAPY: leveragedYield(
        (collateralAPY.organicAPY || 0) + (collateralAPY.feeAPY || 0),
        debtAPY.totalAPY,
        leverageRatio
      ),
      incentives: collateralAPY.incentives?.map(({ symbol, incentiveAPY }) => ({
        symbol,
        incentiveAPY: leveragedYield(incentiveAPY, 0, leverageRatio),
      })),
      leverageRatio,
      debtAPY: debtAPY.totalAPY,
      pointMultiples: collateralAPY.pointMultiples
        ? Object.keys(collateralAPY.pointMultiples).reduce((acc, k) => {
            if (collateralAPY.pointMultiples) {
              acc[k] =
                leveragedYield(
                  collateralAPY.pointMultiples[k] || 0,
                  0,
                  leverageRatio
                ) || 0;
            }
            return acc;
          }, {} as Record<string, number>)
        : undefined,
    };
  };

  const getDefaultLeveragedNTokenAPYs = (token: TokenDefinition) => {
    if (!token.currencyId) throw Error('Invalid token currency');
    if (token.tokenType !== 'nToken') throw Error('Invalid token type');
    const { defaultLeverageRatio } = getLeverageRatios(token);
    const debtTokens = getDebtTokens(token.currencyId);

    return debtTokens.map((d) => ({
      apy: getLeveragedAPY(
        TokenBalance.zero(token),
        TokenBalance.zero(d),
        defaultLeverageRatio
      ),
      debtToken: d,
    }));
  };

  const getDefaultVaultAPYs = (vaultAddress: string) => {
    return getVaultShares('VaultShare').map((share) => {
      if (!share.maturity) throw Error('Invalid share maturity');
      const debt = getVaultDebt(vaultAddress, share.maturity);
      const { defaultLeverageRatio } = getLeverageRatios(share);

      return {
        apy: getLeveragedAPY(
          TokenBalance.zero(share),
          TokenBalance.zero(debt),
          defaultLeverageRatio
        ),
        debtToken: debt,
      };
    });
  };

  const getDebtOrCollateralFactor = (
    token: TokenDefinition,
    isBorrow: boolean
  ) => {
    if (!token.currencyId) throw Error('Invalid token currency');
    const buffer = getConfig(token.currencyId).debtBuffer;
    const haircut = getConfig(token.currencyId).collateralHaircut;
    const underlying = getUnderlying(token.currencyId);

    const unit = TokenBalance.unit(underlying).toToken(token);
    if (isBorrow) {
      return (
        Math.abs(unit.neg().toRiskAdjustedUnderlying().toFloat() * buffer) / 100
      ).toFixed(4);
    } else {
      return (
        (unit.toRiskAdjustedUnderlying().toFloat() * haircut) /
        100
      ).toFixed(4);
    }
  };

  const getUniqueUnderlyingSymbols = (productGroupData: ProductGroupData) => {
    const uniqueUnderlyingSymbols = productGroupData
      .flat()
      .map((item) => item.underlying?.symbol)
      .filter((symbol): symbol is string => symbol !== undefined)
      .reduce<string[]>((acc, symbol) => {
        if (!acc.includes(symbol)) {
          acc.push(symbol);
        }
        return acc;
      }, []);

    return uniqueUnderlyingSymbols;
  };

  const getDefaultHighestAPYSymbol = (productGroupData: ProductGroupData) => {
    const highestTotalAPYBySymbol: Record<string, number> = {};
    productGroupData.flat().forEach((item) => {
      const symbol = item.underlying?.symbol;
      if (symbol) {
        const totalAPY = item.apy?.totalAPY || 0;

        if (!highestTotalAPYBySymbol[symbol]) {
          highestTotalAPYBySymbol[symbol] = totalAPY;
        } else {
          highestTotalAPYBySymbol[symbol] += totalAPY;
        }
      }
    });

      let highestAPYSymbol = '';
      let highestAPYValue = 0;
      for (const data in highestTotalAPYBySymbol) {
        if (highestTotalAPYBySymbol[data] > highestAPYValue) {
          highestAPYValue = highestTotalAPYBySymbol[data];
          highestAPYSymbol = data;
        }
      }

      return highestAPYSymbol;
  };

  const getPortfolioStateZeroBorrowData = () => {
    const group = ['fCash', 'PrimeDebt'];
    const productGroupData = group.map((group) => {
      return self
        .getTokensByType(group)
        .filter((data) => data?.isFCashDebt || data?.tokenType === 'PrimeDebt')
        .map((t) => {
          return {
            token: t,
            apy: getSpotAPY(t.id),
            tvl: getTVL(t),
            liquidity: getLiquidity(t),
            underlying: t.underlying
              ? self.getTokenByID(t.underlying)
              : undefined,
            collateralFactor: getDebtOrCollateralFactor(t, false),
          };
        });
    });
    const tokenList = getUniqueUnderlyingSymbols(productGroupData);
    const defaultSymbol = 'ETH';
    return {
      tokenList,
      productGroupData: productGroupData,
      defaultSymbol,
    };
  };

  const getPortfolioStateZeroEarnData = () => {
    const group = ['fCash', 'PrimeCash', 'nToken'];
    const productGroupData = group.map((group) => {
      return self
        .getTokensByType(group)
        .filter((data) => !data?.isFCashDebt)
        .map((t) => {
          return {
            token: t,
            apy: getSpotAPY(t.id),
            tvl: getTVL(t),
            liquidity: getLiquidity(t),
            underlying: t.underlying
              ? self.getTokenByID(t.underlying)
              : undefined,
            collateralFactor: getDebtOrCollateralFactor(t, false),
          };
        });
    });
    const tokenList = getUniqueUnderlyingSymbols(productGroupData);
    const highestAPYSymbol = getDefaultHighestAPYSymbol(productGroupData);

    return {
      tokenList,
      productGroupData,
      defaultSymbol: highestAPYSymbol,
    };
  };

  return {
    getSpotAPY,
    getAnnualizedNOTEIncentives,
    getAnnualizedSecondaryIncentives,
    getTVL,
    getLiquidity,
    getLeverageRatios,
    getSimulatedAPY,
    getLeveragedAPY,
    getDebtOrCollateralFactor,
    getDefaultLeveragedNTokenAPYs,
    getDefaultVaultAPYs,
    getPortfolioStateZeroEarnData,
    getPortfolioStateZeroBorrowData,
  };
};
