import { useTheme } from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { HEALTH_FACTOR_RISK_LEVELS } from '@notional-finance/util';
import { IntlShape, useIntl, defineMessages } from 'react-intl';
import { useCurrentTradeContext } from '../context/use-trade-context';

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

export function useVaultLiquidationRisk() {
  const { liquidationPrices, tooRisky, postAccountNoRisk, healthFactor } =
    useVaultDetails();

  const liquidationRiskTableData = healthFactor
    ? [...liquidationPrices, healthFactor]
    : [];

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
  if (!trade) {
    return {
      onlyCurrent: false,
      tooRisky: false,
      priorAccountNoRisk: true,
      postAccountNoRisk: true,
      tableData: [],
      liquidationPrices: [],
      healthFactor: undefined,
    };
  }

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
