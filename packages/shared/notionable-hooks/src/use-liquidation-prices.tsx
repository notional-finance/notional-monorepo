import { useMemo } from 'react';
import {
  TokenDefinition,
  FiatKeys,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  getMidnightUTC,
  percentChange,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { usePortfolioRiskProfile, useVaultRiskProfiles } from './use-account';
import { useFiat } from './use-user-settings';
import { useCurrency } from './use-market';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

function usePriceChanges(baseCurrency: FiatKeys) {
  const { allTokens } = useCurrency();

  return useMemo(() => {
    return allTokens.map((asset) => {
      const unit = TokenBalance.unit(asset);
      const midnight = getMidnightUTC();
      const oneDay = midnight - SECONDS_IN_DAY;
      const sevenDay = midnight - 7 * SECONDS_IN_DAY;
      const currentUnderlying = unit.toUnderlying();
      const currentFiat = unit.toFiat(baseCurrency);

      let oneDayUnderlying: TokenBalance | undefined;
      let oneDayFiat: TokenBalance | undefined;
      let sevenDayUnderlying: TokenBalance | undefined;
      let sevenDayFiat: TokenBalance | undefined;
      try {
        oneDayUnderlying = unit.toUnderlying(oneDay);
        oneDayFiat = unit.toFiat(baseCurrency, oneDay);
        sevenDayUnderlying = unit.toUnderlying(sevenDay);
        sevenDayFiat = unit.toFiat(baseCurrency, sevenDay);
      } catch (e) {
        // these will be set to undefined
      }

      return {
        asset,
        currentFiat,
        oneDayFiatChange: percentChange(
          currentFiat.toFloat(),
          oneDayFiat?.toFloat()
        ),
        sevenDayFiatChange: percentChange(
          currentFiat.toFloat(),
          sevenDayFiat?.toFloat()
        ),
        currentUnderlying,
        oneDayUnderlyingChange: percentChange(
          currentUnderlying.toFloat(),
          oneDayUnderlying?.toFloat()
        ),
        sevenDayUnderlyingChange: percentChange(
          currentUnderlying.toFloat(),
          sevenDayUnderlying?.toFloat()
        ),
      };
    });
  }, [allTokens, baseCurrency]);
}

function parseFiatLiquidationPrice(
  asset: TokenDefinition,
  baseCurrency: FiatKeys,
  threshold: TokenBalance | null,
  c: ReturnType<typeof usePriceChanges>[number] | undefined,
  secondary: string
) {
  return {
    // Used on portfolio screen
    exchangeRate: {
      symbol: asset.symbol,
      label: (
        <span>
          {asset.symbol}
          <span style={{ color: secondary }}>&nbsp;/&nbsp;{baseCurrency}</span>
        </span>
      ),
    },
    // Used on overview screen
    collateral: {
      symbol: asset.symbol,
      label: asset.symbol,
    },
    // Used on overview screen
    riskFactor: {
      data: [
        {
          displayValue: (
            <span>
              {asset.symbol}
              <span style={{ color: secondary }}>
                &nbsp;/&nbsp;{baseCurrency}
              </span>
            </span>
          ),
          isNegative: false,
        },
        {
          displayValue: 'Chainlink Oracle Price',
          isNegative: false,
        },
      ],
    },
    currentPrice: c?.currentFiat.toDisplayStringWithSymbol(3) || '',
    oneDayChange: c?.oneDayFiatChange
      ? formatNumberAsPercent(c?.oneDayFiatChange)
      : '',
    sevenDayChange: c?.sevenDayFiatChange
      ? formatNumberAsPercent(c?.sevenDayFiatChange)
      : '',
    liquidationPrice: threshold
      ?.toFiat(baseCurrency)
      .toDisplayStringWithSymbol(3),
  };
}

function parseUnderlyingLiquidationPrice(
  asset: TokenDefinition,
  threshold: TokenBalance | null,
  c: ReturnType<typeof usePriceChanges>[number] | undefined,
  secondary: string
) {
  const { icon, titleWithMaturity } = formatTokenType(asset);
  const liquidationPrice = threshold
    ?.toUnderlying()
    .toDisplayStringWithSymbol(3);
  return {
    // Used on portfolio screen
    exchangeRate: {
      symbol:
        asset.tokenType === 'VaultShare' && threshold?.toUnderlying()?.symbol
          ? threshold?.toUnderlying()?.symbol
          : icon,
      label: (
        <span>
          {titleWithMaturity}
          <span style={{ color: secondary }}>
            &nbsp;/&nbsp;{threshold?.underlying.symbol || ''}
          </span>
        </span>
      ),
    },
    currentPrice: c?.currentUnderlying.toDisplayStringWithSymbol(3) || '',
    oneDayChange: c?.oneDayUnderlyingChange
      ? formatNumberAsPercent(c?.oneDayUnderlyingChange)
      : '',
    sevenDayChange: c?.sevenDayUnderlyingChange
      ? formatNumberAsPercent(c?.sevenDayUnderlyingChange)
      : '',
    liquidationPrice,
  };
}

export function useCurrentETHPrice() {
  const baseCurrency = useFiat();
  const priceChange = usePriceChanges(baseCurrency);
  const ethChange = priceChange.find(({ asset }) => asset.symbol === 'ETH');

  return {
    ethPrice: ethChange?.currentFiat,
    oneDayChange: ethChange?.oneDayFiatChange || 0,
  };
}

export function useCurrentLiquidationPrices() {
  const portfolio = usePortfolioRiskProfile();
  const vaults = useVaultRiskProfiles();
  const baseCurrency = useFiat();
  const priceChanges = usePriceChanges(baseCurrency);
  const portfolioRisk = portfolio.getAllLiquidationPrices();
  const theme = useTheme();
  const secondary = (theme as NotionalTheme).palette.typography.light;

  const exchangeRateRisk = portfolioRisk
    .filter((p) => p.asset.tokenType === 'Underlying')
    .map(({ asset, threshold }) => {
      return parseFiatLiquidationPrice(
        asset,
        baseCurrency,
        threshold,
        priceChanges.find((t) => t.asset.id === asset.id),
        secondary
      );
    });

  const assetPriceRisk = portfolioRisk
    .filter((p) => p.asset.tokenType !== 'Underlying')
    .map(({ asset, threshold }) => {
      return parseUnderlyingLiquidationPrice(
        asset,
        threshold,
        priceChanges.find((t) => t.asset.id === asset.id),
        secondary
      );
    });

  const vaultLiquidation = vaults.map((v) => {
    return {
      vaultAddress: v.vaultAddress,
      liquidationPrices: v
        .getAllLiquidationPrices()
        .filter(({ asset }) => asset.tokenType === 'VaultShare')
        .map(({ asset, threshold }) => ({
          ...parseUnderlyingLiquidationPrice(
            asset,
            threshold,
            priceChanges.find((t) => t.asset.id === asset.id),
            secondary
          ),
          collateral: {
            symbol: threshold?.underlying.symbol || '',
            label: v.vaultConfig.name,
            caption: 'Leveraged Vault',
          },
          riskFactor: {
            data: [
              {
                displayValue: (
                  <span>
                    Vault Shares
                    <span style={{ color: secondary }}>
                      &nbsp;/&nbsp;{threshold?.underlying.symbol || ''}
                    </span>
                  </span>
                ),
                isNegative: false,
              },
              {
                displayValue: 'Chainlink Oracle Price',
                isNegative: false,
              },
            ],
          },
        })),
    };
  });

  return { exchangeRateRisk, assetPriceRisk, vaultLiquidation };
}
