import { useTheme } from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import {
  FiatKeys,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { HEALTH_FACTOR_RISK_LEVELS } from '@notional-finance/util';
import { IntlShape, useIntl, defineMessages } from 'react-intl';
import { useCurrentTradeContext } from '../context/use-trade-context';
import { useAppStore } from '../context/use-root-store';

function formatVaultLiquidationPrices(
  liquidationPrice: {
    asset: TokenDefinition;
    debt?: TokenDefinition;
    current?: TokenBalance | null;
    updated?: TokenBalance | null;
    changeType: string;
    greenOnArrowUp: boolean;
  }[],
  intl: IntlShape,
  hideArrow?: boolean
) {
  return (
    (liquidationPrice || []).map((p) => {
      return {
        ...p,
        label: p.debt
          ? intl.formatMessage(
              { defaultMessage: '{asset} / {base} Liquidation Price' },
              {
                asset: p.asset.symbol,
                base: p.debt.symbol,
              }
            )
          : intl.formatMessage(
              { defaultMessage: '{asset} Liquidation Price' },
              {
                asset: formatTokenType(p.asset).title,
              }
            ),
        current:
          p.debt && p.current
            ? p.current.toToken(p.debt).toDisplayStringWithSymbol()
            : 'No Risk',
        updated:
          p.debt && p.updated
            ? p.updated.toToken(p.debt).toDisplayStringWithSymbol()
            : 'No Risk',
        textColor: '',
        hideArrow: hideArrow || false,
      };
    }) || []
  );
}

function formatLiquidationPrices(
  liquidationPrice: {
    asset: TokenDefinition;
    debt?: TokenDefinition;
    current?: TokenBalance | null;
    updated?: TokenBalance | null;
    isPriceRisk: boolean;
    changeType: string;
    greenOnArrowUp: boolean;
  }[],
  baseCurrency: FiatKeys,
  intl: IntlShape,
  hideArrow?: boolean
) {
  return (
    (liquidationPrice || []).map((p) => {
      return {
        ...p,
        label: p.isPriceRisk
          ? intl.formatMessage(
              { defaultMessage: '{asset} / {base} Liquidation Price' },
              {
                asset: p.asset.symbol,
                base: baseCurrency,
              }
            )
          : intl.formatMessage(
              { defaultMessage: '{asset} Liquidation Price' },
              {
                asset: formatTokenType(p.asset).title,
              }
            ),
        current: p.isPriceRisk
          ? p.current?.toFiat(baseCurrency).toDisplayStringWithSymbol() ||
            'No Risk'
          : p.current?.toUnderlying().toDisplayStringWithSymbol() || 'No Risk',
        updated: p.isPriceRisk
          ? p.updated?.toFiat(baseCurrency).toDisplayStringWithSymbol() ||
            'No Risk'
          : p.updated?.toUnderlying().toDisplayStringWithSymbol() || 'No Risk',
        textColor: '',
        hideArrow: hideArrow || false,
      };
    }) || []
  );
}

export function formatHealthFactorValues(
  healthFactorValue: null | number | undefined,
  theme: NotionalTheme
) {
  const textColor =
    healthFactorValue &&
    healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.HIGH_RISK
      ? colors.red
      : healthFactorValue &&
        healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.MEDIUM_RISK
      ? colors.orange
      : healthFactorValue &&
        healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.LOW_RISK
      ? theme.palette.secondary.light
      : theme.palette.secondary.light;

  const value =
    healthFactorValue && healthFactorValue > 5
      ? '5+ / 5.0'
      : !healthFactorValue
      ? 'No Risk'
      : ` ${healthFactorValue?.toFixed(2)} / 5.0`;
  return { value, textColor };
}

export function useTradeLiquidationPrice() {
  const trade = useCurrentTradeContext();
  const l = trade?.getTradeLiquidationPrices();
  return trade?.collateral
    ? (
        l?.postTrade?.find((p) => p.asset.id === trade.collateral?.id) ||
        l?.preTrade?.find((p) => p.asset === trade.collateral?.id)
      )?.threshold?.toUnderlying()
    : undefined;
}

export function usePortfolioLiquidationRisk() {
  const trade = useCurrentTradeContext();
  const intl = useIntl();
  const { baseCurrency } = useAppStore();
  const theme = useTheme();
  if (!trade) throw new Error('No trade model');

  const {
    onlyCurrent,
    healthFactor: _h,
    liquidationPrice,
    priorAccountNoRisk,
    postAccountNoRisk,
    tooRisky,
  } = trade.getRiskSummary();

  const hideArrow = !onlyCurrent && priorAccountNoRisk ? true : false;
  const currentHFData = formatHealthFactorValues(_h?.current, theme);
  const updatedHFData = formatHealthFactorValues(_h?.updated, theme);

  const healthFactor = {
    ..._h,
    asset: undefined,
    label: {
      text: defineMessages({
        content: { defaultMessage: 'Health Factor' },
        toolTipContent: {
          defaultMessage:
            'Your health factor shows your risk. A lower health factor means you have more risk. If your health factor drops below 1, you can be liquidated.',
        },
      }),
    },
    current: currentHFData?.value,
    updated: updatedHFData?.value,
    textColor: updatedHFData?.textColor,
    hideArrow,
  };

  const liquidationPrices = formatLiquidationPrices(
    liquidationPrice,
    baseCurrency,
    intl,
    hideArrow
  );

  return {
    onlyCurrent,
    tooRisky,
    priorAccountNoRisk,
    postAccountNoRisk,
    tableData: [healthFactor, ...liquidationPrices],
  };
}

export function useVaultLiquidationRisk() {
  const { liquidationPrices, tooRisky, postAccountNoRisk, healthFactor } =
    useVaultDetails();

  const liquidationRiskTableData = [...liquidationPrices, healthFactor];

  return {
    tooRisky,
    postAccountNoRisk,
    tableData: liquidationRiskTableData,
  };
}

export function useVaultDetails() {
  const trade = useCurrentTradeContext();
  const intl = useIntl();
  const theme = useTheme();
  if (!trade) throw new Error('No trade model');
  const {
    onlyCurrent,
    priorAccountNoRisk,
    postAccountNoRisk,
    tooRisky,
    healthFactor: _h,
    liquidationPrice,
    totalAPY,
    netWorth,
    borrowAPY,
  } = trade.getVaultRiskSummary();

  const hideArrow = !onlyCurrent && priorAccountNoRisk ? true : false;
  const currentHFData = formatHealthFactorValues(_h?.current, theme);
  const updatedHFData = formatHealthFactorValues(_h?.updated, theme);

  const healthFactor = {
    ..._h,
    asset: undefined,
    label: {
      text: defineMessages({
        content: { defaultMessage: 'Health Factor' },
        toolTipContent: {
          defaultMessage:
            'Your health factor shows your risk. A lower health factor means you have more risk. If your health factor drops below 1, you can be liquidated.',
        },
      }),
    },
    current: {
      data: [
        {
          displayValue:
            onlyCurrent && _h?.current
              ? currentHFData?.value
              : _h?.current?.toFixed(2) || '',
          isNegative: false,
          showPositiveAsGreen: true,
          textColor: currentHFData?.textColor,
        },
      ],
    },
    updated: updatedHFData?.value,
    textColor: updatedHFData?.textColor,
    hideArrow,
  };

  const factors = [
    {
      ...totalAPY,
      label: {
        text: defineMessages({
          content: { defaultMessage: 'Total APY' },
        }),
      },
    },
    healthFactor,
    {
      ...netWorth,
      label: {
        text: defineMessages({
          content: { defaultMessage: 'Net Worth' },
        }),
      },
    },
    {
      ...borrowAPY,
      label: {
        text: defineMessages({
          content: { defaultMessage: 'Borrow APY' },
        }),
      },
    },
  ];

  const liquidationPrices = formatVaultLiquidationPrices(
    (liquidationPrice || []).filter((p) => p.isPriceRisk),
    intl
  );

  return {
    onlyCurrent,
    tooRisky,
    priorAccountNoRisk,
    postAccountNoRisk,
    tableData: [...factors, ...liquidationPrices],
    liquidationPrices,
    healthFactor,
  };
}
