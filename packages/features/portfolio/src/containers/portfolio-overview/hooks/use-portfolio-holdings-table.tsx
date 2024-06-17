import { useMemo } from 'react';
import {
  IconCell,
  MultiValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { formatCryptoWithFiat } from '@notional-finance/helpers';
import {
  useAccountReady,
  usePortfolioRiskProfile,
  useFiat,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { Registry } from '@notional-finance/core-entities';

export const useTotalHoldingsTable = () => {
  const baseCurrency = useFiat();
  const network = useSelectedNetwork();
  const portfolio = usePortfolioRiskProfile(network);
  const isAccountReady = useAccountReady(network);

  const totalHoldingsColumns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Currency"
            description={'Currency header'}
          />
        ),
        cell: IconCell,
        accessorKey: 'currency',
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Net Worth"
            description={'Net Worth header'}
          />
        ),
        cell: MultiValueCell,
        accessorKey: 'netWorth',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Assets"
            description={'assets header'}
          />
        ),
        cell: MultiValueCell,
        accessorKey: 'assets',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Debts"
            description={'Debts header'}
          />
        ),
        cell: MultiValueCell,
        accessorKey: 'debts',
        textAlign: 'right',
      },
    ],
    []
  );

  const tokens = Registry.getTokenRegistry();
  const isReady = network && isAccountReady;
  const totalHoldingsData = isReady
    ? portfolio?.allCurrencyIds.map((currencyId) => {
        const underlying = tokens.getUnderlying(network, currencyId);
        const totalAssets = portfolio.totalCurrencyAssets(
          currencyId,
          underlying.symbol
        );
        const totalDebts = portfolio.totalCurrencyDebts(
          currencyId,
          underlying.symbol
        );

        return {
          currency: underlying.symbol,
          netWorth: formatCryptoWithFiat(
            baseCurrency,
            totalAssets.add(totalDebts)
          ),
          assets: formatCryptoWithFiat(baseCurrency, totalAssets),
          debts: formatCryptoWithFiat(baseCurrency, totalDebts),
          isDebt: totalDebts ? true : false,
        };
      }) || []
    : [];

  if (isReady && portfolio && portfolio.balances.length > 0) {
    const netWorth = portfolio.netWorth();
    const totalAssets = portfolio.totalAssets();
    const totalDebt = portfolio.totalDebt();

    totalHoldingsData.push({
      currency: 'Total',
      netWorth: {
        data: [
          {
            displayValue: netWorth
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: netWorth.isNegative(),
          },
        ],
      },
      assets: {
        data: [
          {
            displayValue: totalAssets
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: totalAssets.isNegative(),
          },
        ],
      },
      debts: {
        data: [
          {
            displayValue: totalDebt
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: false,
          },
        ],
      },
      isDebt: totalDebt ? true : false,
    });
  }

  return { totalHoldingsColumns, totalHoldingsData };
};
