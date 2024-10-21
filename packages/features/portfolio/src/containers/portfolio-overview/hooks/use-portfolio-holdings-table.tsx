import {
  DataTableColumn,
  IconCell,
  MultiValueCell,
} from '@notional-finance/mui';
import { formatCryptoWithFiat } from '@notional-finance/helpers';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { FiatKeys } from '@notional-finance/core-entities';
import { useWalletStore } from '@notional-finance/notionable';

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
  const network = useSelectedNetwork();
  const walletStore = useWalletStore();
  const { holdings, totals } =
    walletStore.networkAccounts[network].getTotalCurrencyHoldings();

  const totalHoldingsData = holdings.map(
    ({ currency, netWorth, assets, debts }) => {
      return {
        currency,
        netWorth: formatCryptoWithFiat(baseCurrency, netWorth),
        assets: formatCryptoWithFiat(baseCurrency, assets),
        debts: formatCryptoWithFiat(baseCurrency, debts),
      };
    }
  );

  totalHoldingsData.push({
    currency: 'Total',
    netWorth: {
      data: [
        {
          displayValue: totals.netWorth
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false),
          isNegative: totals.netWorth.isNegative(),
        },
      ],
    },
    assets: {
      data: [
        {
          displayValue: totals.assets
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false),
          isNegative: totals.assets.isNegative(),
        },
      ],
    },
    debts: {
      data: [
        {
          displayValue: totals.debts
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false),
          isNegative: false,
        },
      ],
    },
    isDebt: true,
  });

  return { totalHoldingsColumns: TotalHoldingsColumns, totalHoldingsData };
};
