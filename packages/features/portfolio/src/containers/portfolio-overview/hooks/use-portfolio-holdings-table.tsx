import {
  DataTableColumn,
  IconCell,
  MultiValueCell,
} from '@notional-finance/mui';
import { formatCryptoWithFiat } from '@notional-finance/helpers';
import { useCurrentNetworkAccount } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { FiatKeys } from '@notional-finance/core-entities';

const TotalHoldingsColumns: DataTableColumn[] = [
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
      <FormattedMessage defaultMessage="Assets" description={'assets header'} />
    ),
    cell: MultiValueCell,
    accessorKey: 'assets',
    textAlign: 'right',
  },
  {
    header: (
      <FormattedMessage defaultMessage="Debts" description={'Debts header'} />
    ),
    cell: MultiValueCell,
    accessorKey: 'debts',
    textAlign: 'right',
  },
] as const;

export const useTotalHoldingsTable = (baseCurrency: FiatKeys) => {
  const currentAccount = useCurrentNetworkAccount();
  const totalCurrencyHoldings = currentAccount?.totalCurrencyHoldings;

  const totalHoldingsData = totalCurrencyHoldings
    ? totalCurrencyHoldings.holdings.map(
        ({ currency, netWorth, assets, debts }) => {
          return {
            currency,
            netWorth: formatCryptoWithFiat(baseCurrency, netWorth),
            assets: formatCryptoWithFiat(baseCurrency, assets),
            debts: formatCryptoWithFiat(baseCurrency, debts),
          };
        }
      )
    : [];

  if (totalCurrencyHoldings?.totals) {
    totalHoldingsData.push({
      currency: 'Total',
      netWorth: {
        data: [
          {
            displayValue: totalCurrencyHoldings.totals.netWorth
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: totalCurrencyHoldings.totals.netWorth.isNegative(),
          },
        ],
      },
      assets: {
        data: [
          {
            displayValue: totalCurrencyHoldings.totals.assets
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: totalCurrencyHoldings.totals.assets.isNegative(),
          },
        ],
      },
      debts: {
        data: [
          {
            displayValue: totalCurrencyHoldings.totals.debts
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false),
            isNegative: false,
          },
        ],
      },
    });
  }

  return { totalHoldingsColumns: TotalHoldingsColumns, totalHoldingsData };
};
