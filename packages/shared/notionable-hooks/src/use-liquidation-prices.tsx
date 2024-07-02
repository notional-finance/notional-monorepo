import { useState, useEffect } from 'react';
import {
  TokenDefinition,
  FiatKeys,
  TokenBalance,
  PriceChange,
} from '@notional-finance/core-entities';
import { usePortfolioLiquidationPrices, useVaultHoldings } from './use-account';
import { useFiat } from './use-user-settings';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import {
  Network,
  SECONDS_IN_DAY,
  getMidnightUTC,
  percentChange,
} from '@notional-finance/util';
import { useAppContext, useNOTE } from './use-notional';

function usePriceChanges(network: Network | undefined) {
  const {
    appState: { priceChanges },
  } = useAppContext();

  return priceChanges && network && priceChanges[network]
    ? priceChanges[network]
    : { oneDay: [], sevenDay: [] };
}

function parseFiatLiquidationPrice(
  asset: TokenDefinition,
  baseCurrency: FiatKeys,
  threshold: TokenBalance | null,
  oneDay: PriceChange | undefined,
  sevenDay: PriceChange | undefined,
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
    currentPrice: oneDay?.currentFiat.toDisplayStringWithSymbol(3) || '',
    oneDayChange: oneDay?.fiatChange
      ? formatNumberAsPercent(oneDay.fiatChange)
      : '',
    sevenDayChange: sevenDay?.fiatChange
      ? formatNumberAsPercent(sevenDay?.fiatChange)
      : '',
    liquidationPrice: threshold
      ?.toFiat(baseCurrency)
      .toDisplayStringWithSymbol(3),
  };
}

function parseUnderlyingLiquidationPrice(
  asset: TokenDefinition,
  threshold: TokenBalance | null,
  oneDay: PriceChange | undefined,
  sevenDay: PriceChange | undefined,
  secondary: string
) {
  const { icon, titleWithMaturity } = formatTokenType(asset);
  const liquidationPrice = threshold
    ?.toUnderlying()
    .toDisplayStringWithSymbol(2);
  return {
    // Used on portfolio screen
    exchangeRate: {
      symbol:
        asset.tokenType === 'VaultShare' && threshold
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
    currentPrice: oneDay?.currentUnderlying.toDisplayStringWithSymbol(2) || '',
    oneDayChange: oneDay?.underlyingChange
      ? formatNumberAsPercent(oneDay.underlyingChange)
      : '',
    sevenDayChange: sevenDay?.underlyingChange
      ? formatNumberAsPercent(sevenDay?.underlyingChange)
      : '',
    liquidationPrice,
  };
}

export function useCurrentETHPrice() {
  // NOTE: the hardcoded network here doesn't really matter
  const { oneDay } = usePriceChanges(Network.arbitrum);
  const ethChange = oneDay.find(({ asset }) => asset.symbol === 'ETH');

  return {
    ethPrice: ethChange?.currentFiat,
    oneDayChange: ethChange?.fiatChange || 0,
  };
}

export function useNotePrice() {
  const [notePrice, setNOTEPrice] = useState<TokenBalance | undefined>();
  const [notePriceChange, setNOTEPriceChange] = useState<number | undefined>();
  const note = useNOTE(Network.all);

  useEffect(() => {
    const oneNote = note ? TokenBalance.unit(note) : undefined;
    const price = oneNote?.toFiat('USD');
    setNOTEPrice(price);
    let notePriceYesterday = undefined as TokenBalance | undefined;
    try {
      notePriceYesterday = oneNote?.toFiat(
        'USD',
        getMidnightUTC() - SECONDS_IN_DAY
      );
    } catch {
      notePriceYesterday = undefined;
    }
    setNOTEPriceChange(
      percentChange(price?.toFloat(), notePriceYesterday?.toFloat())
    );
  }, [note]);

  return { notePrice, notePriceChange };
}

export function useCurrentLiquidationPrices(network: Network | undefined) {
  const portfolio = usePortfolioLiquidationPrices(network);
  const vaults = useVaultHoldings(network);
  const baseCurrency = useFiat();
  const { oneDay, sevenDay } = usePriceChanges(network);
  const theme = useTheme();
  const secondary = (theme as NotionalTheme).palette.typography.light;

  const exchangeRateRisk = portfolio
    .filter((p) => p.asset.tokenType === 'Underlying')
    .map(({ asset, threshold }) => {
      return parseFiatLiquidationPrice(
        asset,
        baseCurrency,
        threshold,
        oneDay.find((t) => t.asset.id === asset.id),
        sevenDay.find((t) => t.asset.id === asset.id),
        secondary
      );
    });

  const assetPriceRisk = portfolio
    .filter((p) => p.asset.tokenType !== 'Underlying')
    .map(({ asset, threshold }) => {
      return parseUnderlyingLiquidationPrice(
        asset,
        threshold,
        oneDay.find((t) => t.asset.id === asset.id),
        sevenDay.find((t) => t.asset.id === asset.id),
        secondary
      );
    });

  const vaultLiquidation = vaults.map(({ vault, liquidationPrices }) => {
    return {
      vaultAddress: vault.vaultAddress,
      liquidationPrices: liquidationPrices
        .filter(({ asset }) => asset.tokenType === 'VaultShare')
        .map(({ asset, threshold }) => ({
          ...parseUnderlyingLiquidationPrice(
            asset,
            threshold,
            oneDay.find((t) => t.asset.id === asset.id),
            sevenDay.find((t) => t.asset.id === asset.id),
            secondary
          ),
          collateral: {
            symbol: threshold?.underlying.symbol || '',
            label: vault.vaultConfig.name,
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
