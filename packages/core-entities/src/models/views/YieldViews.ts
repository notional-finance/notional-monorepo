import { TokenBalance } from '../../token-balance';
import { NetworkModel } from '../NetworkModel';
import {
  leveragedYield,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
} from '@notional-finance/util';
import { TokenDefinition } from '../../Definitions';
import { Instance } from 'mobx-state-tree';
import { TokenViews } from './TokenViews';
import { VaultViews } from './VaultViews';

export interface APYData {
  totalAPY?: number;
  organicAPY?: number;
  assetAPY?: number;
  feeAPY?: number;
  apySpread?: number;
  incentiveAPY?: number;
  incentives?: {
    symbol: string;
    incentiveAPY: number;
  }[];
  utilization?: number;
  pointMultiples?: Record<string, number>;
  leverageRatio?: number;
  debtAPY?: number;
}

export interface ProductAPY {
  token: TokenDefinition;
  apy: APYData;
  tvl: TokenBalance;
  liquidity: TokenBalance;
  underlying: TokenDefinition | undefined;
  collateralFactor: string;
  debtToken: TokenDefinition | undefined;
  maxLeverageRatio?: number | undefined;
}

export function createLeveragedAPYData(
  assetData: APYData,
  debtAPY: number,
  leverageRatio: number
) {
  return {
    totalAPY: leveragedYield(assetData.totalAPY, debtAPY, leverageRatio),
    apySpread:
      assetData.totalAPY !== undefined && debtAPY !== undefined
        ? assetData.totalAPY - debtAPY
        : undefined,
    assetAPY: assetData.totalAPY,
    leverageRatio,
    debtAPY,
    organicAPY: leveragedYield(
      (assetData?.organicAPY || 0) + (assetData?.feeAPY || 0),
      debtAPY,
      leverageRatio
    ),
    incentiveAPY: leveragedYield(assetData?.incentiveAPY, 0, leverageRatio),
    incentives: assetData?.incentives?.map(({ symbol, incentiveAPY }) => ({
      symbol,
      incentiveAPY: leveragedYield(incentiveAPY, 0, leverageRatio) || 0,
    })),
    pointMultiples: assetData?.pointMultiples
      ? Object.keys(assetData.pointMultiples).reduce((acc, k) => {
          if (assetData.pointMultiples) {
            acc[k] =
              leveragedYield(
                assetData.pointMultiples[k] || 0,
                0,
                leverageRatio
              ) || 0;
          }
          return acc;
        }, {} as Record<string, number>)
      : undefined,
  };
}

export const YieldViews = (self: Instance<typeof NetworkModel>) => {
  const { getTokenByID, getDebtTokens, getVaultShares, getVaultDebt } =
    TokenViews(self);
  const { getVaultAdapter, getAllListedVaults } = VaultViews(self);

  const getTVL = (token: TokenDefinition) => {
    if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      const adapter = getVaultAdapter(token.vaultAddress);
      // NOTE: this returns the TVL of the vault across all maturities
      return adapter.getVaultTVL();
    }

    return token.totalSupply?.toUnderlying() || TokenBalance.zero(token);
  };

  const getLiquidity = (token: TokenDefinition) => {
    // TODO: this refers to the total liquidity available to borrow
    return getTVL(token);
  };

  const getSpotAPY = (tokenId: string) => {
    const apyData: APYData = { totalAPY: 0 };

    const token = getTokenByID(tokenId);

    if (token.tokenType === 'VaultDebt') {
      apyData.organicAPY = market.getSpotInterestRate(token) || 0;
      apyData.totalAPY = apyData.organicAPY;
    } else if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      const adapter = getVaultAdapter(token.vaultAddress);
      apyData.incentiveAPY = adapter.getRewardAPY();
      apyData.totalAPY = adapter.getVaultAPY();
      apyData.organicAPY = apyData.totalAPY - apyData.incentiveAPY;
      apyData.pointMultiples = adapter.getPointMultiples();
    }

    return apyData;
  };

  const getLeverageRatios = (collateral: TokenDefinition) => {
    if (collateral.tokenType === 'VaultShare' && collateral.vaultAddress) {
      const config = getVaultConfig(collateral.vaultAddress);
      const minLeverageRatio =
        RATE_PRECISION /
        (config.maxRequiredAccountCollateralRatioBasisPoints as number);
      const defaultLeverageRatio =
        RATE_PRECISION / config.maxDeleverageCollateralRatioBasisPoints;
      const maxLeverageRatio =
        RATE_PRECISION / config.minCollateralRatioBasisPoints;

      return { minLeverageRatio, defaultLeverageRatio, maxLeverageRatio };
    }

    throw Error('Invalid token');
  };

  const getSimulatedAPY = (
    netAmount: TokenBalance,
    vaultTradeMetadata?: unknown
  ) => {
    const apyData: APYData = { totalAPY: 0 };

    if (netAmount.tokenType === 'VaultDebt') {
      // If borrowing and withdrawing then it is just prime debt increase. This
      // includes vault debt
      const market = getNotionalMarket(netAmount.currencyId);
      apyData.utilization = market.getPrimeCashUtilization(
        undefined,
        netAmount.unwrapVaultToken().neg()
      );
      apyData.organicAPY =
        100 * (market.getPrimeDebtRate(apyData.utilization) / RATE_PRECISION) ||
        0;
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
    } else if (netAmount.tokenType === 'VaultShare' && netAmount.vaultAddress) {
      const adapter = getVaultAdapter(netAmount.vaultAddress);
      return adapter.getSimulatedAPY(netAmount, vaultTradeMetadata);
    }

    return apyData;
  };

  const getLeveragedAPY = (
    collateralAmount: TokenBalance,
    debtAmount: TokenBalance,
    leverageRatio: number,
    vaultTradeMetadata?: unknown
  ): APYData => {
    const collateralAPY = collateralAmount.isZero()
      ? getSpotAPY(collateralAmount.tokenId)
      : getSimulatedAPY(collateralAmount, vaultTradeMetadata);
    const debtAPY = debtAmount.isZero()
      ? getSpotAPY(debtAmount.tokenId)
      : getSimulatedAPY(debtAmount);

    return createLeveragedAPYData(
      collateralAPY,
      debtAPY.totalAPY || 0,
      leverageRatio
    );
  };

  const getDefaultVaultAPYs = (vaultAddress: string) => {
    return getVaultShares(vaultAddress).map((share) => {
      if (!share.maturity) throw Error('Invalid share maturity');
      const debt = getVaultDebt(vaultAddress);
      const { maxLeverageRatio } = getLeverageRatios(share);

      return {
        apy: getLeveragedAPY(
          TokenBalance.zero(share),
          TokenBalance.zero(debt),
          maxLeverageRatio
        ),
        debtToken: debt,
        vaultShare: share,
      };
    });
  };

  const getAllListedVaultsWithYield = (currencyId?: number) => {
    return getAllListedVaults()
      .filter((v) =>
        currencyId ? v.primaryToken.currencyId === currencyId : true
      )
      .map((v) => {
        const defaultAPYs = getDefaultVaultAPYs(v.vaultAddress || '');
        const maxVaultAPY =
          defaultAPYs.length > 0
            ? defaultAPYs.reduce((max, current) => {
                return (current.apy.totalAPY || 0) > (max.apy.totalAPY || 0)
                  ? current
                  : max;
              }, defaultAPYs[0])
            : undefined;

        const vaultShare = maxVaultAPY?.vaultShare;

        return {
          token: vaultShare,
          apy: maxVaultAPY?.apy,
          tvl: v.vaultTVL,
          maxLeverageRatio: vaultShare
            ? getLeverageRatios(vaultShare).maxLeverageRatio
            : undefined,
          liquidity: v.vaultTVL,
          underlying: vaultShare?.underlying
            ? getTokenByID(vaultShare.underlying)
            : undefined,
          debtToken: maxVaultAPY?.debtToken,
          vaultConfig: v,
        };
      });
  };

  return {
    getSpotAPY,
    getTVL,
    getLiquidity,
    getLeverageRatios,
    getSimulatedAPY,
    getLeveragedAPY,
    getDefaultVaultAPYs,
    getAllListedVaultsWithYield,
  };
};
