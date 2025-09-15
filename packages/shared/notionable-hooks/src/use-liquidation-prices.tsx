import {
  TokenDefinition,
  TokenBalance,
  PriceChange,
  getNetworkModel,
} from '@notional-finance/core-entities';
import { useVaultHoldings } from './use-account';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { Network } from '@notional-finance/util';
import { useObserver } from 'mobx-react-lite';
import { useFetchAnalyticsData } from './use-market';

export function usePriceChanges(
  network: Network | undefined,
  assetId: string | undefined
) {
  const dataSet = useObserver(() =>
    network ? getNetworkModel(network).analytics.priceChanges : undefined
  );
  useFetchAnalyticsData('priceChanges', !!dataSet, network);

  return dataSet && network && assetId
    ? getNetworkModel(network).getPriceChanges(assetId)
    : undefined;
}

function parseUnderlyingLiquidationPrice(
  asset: TokenDefinition,
  threshold: TokenBalance | null,
  oneDay: PriceChange | undefined,
  sevenDay: PriceChange | undefined,
  secondary: string,
  debt?: TokenDefinition
) {
  const { icon, titleWithMaturity } = formatTokenType(asset);
  const liquidationPrice = debt
    ? threshold?.toToken(debt).toDisplayStringWithSymbol(4, false)
    : threshold?.toUnderlying().toDisplayStringWithSymbol(4, false);
  const currentPrice =
    debt && threshold
      ? TokenBalance.unit(threshold.token)
          .toToken(debt)
          .toDisplayStringWithSymbol(4, false)
      : threshold
      ? TokenBalance.unit(threshold.token)
          .toUnderlying()
          .toDisplayStringWithSymbol(4, false)
      : '';

  return {
    // Used on portfolio screen
    exchangeRate: {
      symbol: icon,
      label: (
        <span>
          {titleWithMaturity}
          <span style={{ color: secondary }}>
            &nbsp;/&nbsp;{debt?.symbol || threshold?.underlying.symbol || ''}
          </span>
        </span>
      ),
    },
    currentPrice,
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
  const priceChanges = usePriceChanges(Network.all, 'eth');
  const ethChange = priceChanges?.oneDay;

  return {
    ethPrice: ethChange?.currentFiat,
    oneDayChange: ethChange?.fiatChange || 0,
  };
}

export function useNotePrice() {
  const priceChanges = usePriceChanges(Network.all, 'note');
  const noteChange = priceChanges?.oneDay;
  const notePriceChange = noteChange?.fiatChange || undefined;
  const notePrice = noteChange?.currentFiat.toFiat('USD') || undefined;

  return { notePrice, notePriceChange };
}

export function useCurrentLiquidationPrices(network: Network | undefined) {
  const vaults = useVaultHoldings(network);
  // Ensures price changes are fetched
  usePriceChanges(network, undefined);
  const theme = useTheme();
  const secondary = (theme as NotionalTheme).palette.typography.light;

  const vaultLiquidation =
    vaults?.map(({ vaultAddress, liquidationPrices, name, underlying }) => {
      return {
        vaultAddress,
        liquidationPrices: liquidationPrices.map(
          ({ asset, threshold, debt }) => {
            const { oneDay, sevenDay } =
              getNetworkModel(network).getPriceChanges(asset) || {};
            return {
              ...parseUnderlyingLiquidationPrice(
                getNetworkModel(network).getTokenByID(asset),
                threshold,
                oneDay,
                sevenDay,
                secondary,
                debt ? getNetworkModel(network).getTokenByID(debt) : undefined
              ),
              collateral: {
                symbol: threshold?.underlying.symbol || '',
                label: name,
                caption: 'Leveraged Vault',
              },
              riskFactor: {
                data: [
                  {
                    displayValue: (
                      <span>
                        {getNetworkModel(network).getTokenByID(asset).symbol}
                        <span style={{ color: secondary }}>
                          &nbsp;/&nbsp;{underlying || ''}
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
            };
          }
        ),
      };
    }) || [];

  return { vaultLiquidation };
}
