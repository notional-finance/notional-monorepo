// import { useState } from 'react';
// import {
//   useAccountHistoryChart,
//   useSelectedPortfolioNetwork,
// } from '@notional-finance/notionable-hooks';
import { FiatSymbols, TokenDefinition } from '@notional-finance/core-entities';
// import {
//   useAccountCurrentFactors,
//   useFiat,
// } from '@notional-finance/notionable-hooks';
// import {
//   useWindowDimensions,
//   formatNumberAsPercent,
// } from '@notional-finance/helpers';
import {
  THEME_VARIANTS,
  //   SECONDS_IN_MONTH,
  //   SECONDS_IN_DAY,
  //   getNowSeconds,
} from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import {
  useFiat,
  useTokenHistory,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useApyChart = (token?: TokenDefinition) => {
  const baseCurrency = useFiat();
  const { apyData } = useTokenHistory(token);
  const themeVariant = useThemeVariant();

  console.log({ apyData });

  //   const barChartData = historyData?.map(
  //     ({ assets, debts, netWorth, timestamp }) => {
  //       return {
  //         totalAssets: assets.toFloat(),
  //         totalDebts: debts.toFloat(),
  //         totalNetWorth: netWorth.toFloat(),
  //         timestamp,
  //       };
  //     }
  //   );

  // nTokenBlendedInterestRate;
  // nTokenFeeRate;
  // nTokenIncentiveRate;
  // nTokenSecondaryIncentiveRate;
  // timestamp;
  // totalAPY;

  const barConfig = [
    {
      dataKey: 'totalNetWorth',
      title: <FormattedMessage defaultMessage="Total Net Worth" />,
      toolTipTitle: <FormattedMessage defaultMessage="Net Worth" />,
      fill:
        themeVariant === THEME_VARIANTS.LIGHT
          ? colors.turquoise
          : colors.neonTurquoise,
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: 0,
    },
  ];

  return { barConfig };
};

export default useApyChart;
