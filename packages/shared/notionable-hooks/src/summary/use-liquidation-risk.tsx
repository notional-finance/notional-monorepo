import { useTheme } from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { FiatKeys } from '@notional-finance/core-entities';
import {
  formatTokenType,
  formatNumberAsPercentWithUndefined,
} from '@notional-finance/helpers';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { HEALTH_FACTOR_RISK_LEVELS } from '@notional-finance/util';
import { IntlShape, useIntl, defineMessages } from 'react-intl';
import { useVaultPosition } from '../use-account';
import { useUserSettings } from '../use-user-settings';

function formatLiquidationPrices(
  liquidationPrice: TradeState['liquidationPrice'],
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

export function usePortfolioLiquidationRisk(state: TradeState) {
  const {
    priorAccountRisk,
    postAccountRisk,
    healthFactor: _h,
    liquidationPrice,
  } = state;
  const onlyCurrent = !postAccountRisk;
  const intl = useIntl();
  const { baseCurrency } = useUserSettings();
  const theme = useTheme();
  const priorAccountNoRisk =
    priorAccountRisk === undefined ||
    (priorAccountRisk?.healthFactor === null &&
      priorAccountRisk?.liquidationPrice.length === 0);

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
    current:
      onlyCurrent && _h?.current
        ? currentHFData?.value
        : _h?.current?.toFixed(2) || '',
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
    tooRisky: postAccountRisk?.freeCollateral.isNegative() || false,
    priorAccountNoRisk,
    postAccountNoRisk:
      postAccountRisk?.healthFactor === null &&
      postAccountRisk?.liquidationPrice.length === 0,
    tableData: [healthFactor, ...liquidationPrices],
  };
}

export function useVaultLiquidationRisk(state: VaultTradeState) {
  const { liquidationPrices, tooRisky, postAccountNoRisk, healthFactor } =
    useVaultDetails(state);

  const liquidationRiskTableData = [...liquidationPrices, healthFactor];

  return {
    tooRisky,
    postAccountNoRisk,
    tableData: liquidationRiskTableData,
  };
}

export function useVaultDetails(state: VaultTradeState) {
  const {
    postAccountRisk,
    netWorth,
    healthFactor: _h,
    liquidationPrice,
    borrowAPY,
    totalAPY,
    vaultAddress,
    selectedNetwork,
  } = state;
  const currentPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const onlyCurrent = !postAccountRisk;
  const intl = useIntl();
  const { baseCurrency } = useUserSettings();
  const priorAccountNoRisk =
    currentPosition === undefined || currentPosition?.leverageRatio === null;

  const theme = useTheme();

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
          textColor: updatedHFData?.textColor,
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
      current: formatNumberAsPercentWithUndefined(
        currentPosition?.totalAPY,
        '-'
      ),
      updated: formatNumberAsPercentWithUndefined(totalAPY?.updated, '-'),
    },
    healthFactor,
    {
      ...netWorth,
      label: {
        text: defineMessages({
          content: { defaultMessage: 'Net Worth' },
        }),
      },
      current:
        currentPosition?.netWorth
          ?.toFiat(baseCurrency)
          .toDisplayStringWithSymbol(2, true, false) || '-',
      updated:
        netWorth?.updated
          ?.toFiat(baseCurrency)
          .toDisplayStringWithSymbol(2, true, false) || '-',
    },
    {
      ...borrowAPY,
      label: {
        text: defineMessages({
          content: { defaultMessage: 'Borrow APY' },
        }),
      },
      current: formatNumberAsPercentWithUndefined(
        currentPosition?.borrowAPY,
        '-'
      ),
      updated: formatNumberAsPercentWithUndefined(borrowAPY?.updated, '-'),
    },
  ];

  const liquidationPrices = formatLiquidationPrices(
    (liquidationPrice || []).filter(
      (p) => p.isAssetRisk && p.asset.tokenType === 'VaultShare'
    ),
    baseCurrency,
    intl
  );

  return {
    onlyCurrent,
    tooRisky: postAccountRisk?.aboveMaxLeverageRatio || false,
    priorAccountNoRisk:
      currentPosition === undefined || currentPosition?.leverageRatio === null,
    postAccountNoRisk:
      postAccountRisk === undefined || postAccountRisk?.leverageRatio === null,
    tableData: [...factors, ...liquidationPrices],
    liquidationPrices,
    healthFactor,
  };
}
