import { TokenBalance } from '../../token-balance';
import { NetworkModel } from '../NetworkModel';
import { firstValue, leveragedYield } from '@notional-finance/util';
import { TokenDefinition } from '../../Definitions';
import { Instance } from 'mobx-state-tree';
import { TokenViews } from './TokenViews';
import { VaultViews } from './VaultViews';
import { ExchangeViews } from './ExchangeViews';
import { ConfigurationViews } from './ConfigurationViews';

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
    feeAPY: leveragedYield(assetData?.feeAPY, 0, leverageRatio),
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
  const { getTokenByID, getVaultShare, getVaultDebt } = TokenViews(self);
  const { getVaultAdapter, getAllListedVaults, getVaultFee } = VaultViews(self);
  const { getLendingMarketFromVaultDebt } = ExchangeViews(self);
  const { getMaxLeverageRatio } = ConfigurationViews(self);

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
      const market = getLendingMarketFromVaultDebt(token);
      apyData.organicAPY = market.getSpotInterestRate();
      apyData.totalAPY = apyData.organicAPY;
    } else if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      const adapter = getVaultAdapter(token.vaultAddress);
      apyData.incentiveAPY = adapter.getRewardAPY();
      apyData.totalAPY = adapter.getVaultAPY();
      apyData.organicAPY = apyData.totalAPY - apyData.incentiveAPY;
      apyData.pointMultiples = adapter.getPointMultiples();
      apyData.feeAPY = -1 * getVaultFee(token.vaultAddress);
    }

    return apyData;
  };

  const getLeverageRatios = (vaultDebt: TokenDefinition) => {
    if (vaultDebt.tokenType === 'VaultDebt' && vaultDebt.vaultAddress) {
      const maxLeverageRatio = getMaxLeverageRatio(
        vaultDebt.vaultAddress,
        vaultDebt.address
      );
      const minLeverageRatio = 0;
      const defaultLeverageRatio = maxLeverageRatio * 0.8;

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
      // Get the market from the vault debt token
      const market = getLendingMarketFromVaultDebt(netAmount.token);
      apyData.utilization = market.getUtilizationPercent(
        undefined,
        netAmount.neg()
      );
      apyData.organicAPY = market.getSpotInterestRate();
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

  const getDefaultVaultAPY = (vaultAddress: string) => {
    const lrs = self.configuration?.lendingRouters.map((l) => l.id) || [];
    const share = getVaultShare(vaultAddress);
    // Loop over each lending router and get the APY for that vault
    // on that particular lending router
    const apys = lrs
      .map((l) => {
        const debt = getVaultDebt(vaultAddress, l);
        const { maxLeverageRatio } = getLeverageRatios(debt);

        try {
          return {
            apy: getLeveragedAPY(
              TokenBalance.zero(share),
              TokenBalance.zero(debt),
              maxLeverageRatio
            ),
            tvl: getTVL(share as TokenDefinition),
            liquidity: getLiquidity(share as TokenDefinition),
            debtToken: debt,
            vaultShare: share,
          };
        } catch (e) {
          // We may get errors if the vault is not supported by the lending router
          console.error(e);
          return undefined;
        }
      })
      .filter((a) => a !== undefined);

    // Sort descending and take the highest APY
    return firstValue(
      apys.sort((a, b) => {
        return (b?.apy.totalAPY || 0) - (a?.apy.totalAPY || 0);
      })
    );
  };

  const getAllListedVaultsWithYield = (depositToken?: string) => {
    return getAllListedVaults()
      .filter((v) => (depositToken ? v.depositToken.id === depositToken : true))
      .map((v) => {
        const maxVaultAPY = getDefaultVaultAPY(v.vaultAddress);
        const vaultShare = maxVaultAPY?.vaultShare;

        return {
          token: vaultShare,
          apy: maxVaultAPY?.apy,
          tvl: maxVaultAPY?.tvl,
          liquidity: maxVaultAPY?.liquidity,
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
    getDefaultVaultAPY,
    getAllListedVaultsWithYield,
  };
};
