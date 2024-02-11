import { useTheme } from '@mui/material';
import { Registry } from '@notional-finance/core-entities';
import { DataTableColumn, NegativeValueCell } from '@notional-finance/mui';
import { VaultTradeState } from '@notional-finance/notionable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export const useVaultPriceExposure = (state: VaultTradeState) => {
  const theme = useTheme();
  const { priorVaultBalances, postTradeBalances, selectedNetwork } = state;
  const accountVaultShares =
    priorVaultBalances?.find((t) => t.tokenType === 'VaultShare') ||
    postTradeBalances?.find((t) => t.tokenType === 'VaultShare');
  const priceExposure = useMemo(() => {
    const vaultAdapter =
      selectedNetwork && state.vaultAddress
        ? Registry.getVaultRegistry().getVaultAdapter(
            selectedNetwork,
            state.vaultAddress
          )
        : undefined;
    return vaultAdapter?.getPriceExposure() || [];
  }, [selectedNetwork, state.vaultAddress]);

  const columns: DataTableColumn[] = [
    {
      Header: <FormattedMessage defaultMessage="Exit Price" />,
      accessor: 'price',
      textAlign: 'left',
      width: theme.spacing(31.75),
    },
    {
      Header: <FormattedMessage defaultMessage="Vault Share Price" />,
      accessor: 'vaultSharePrice',
      textAlign: 'right',
      width: theme.spacing(31.75),
    },
    {
      Header: <FormattedMessage defaultMessage="Profit / Loss" />,
      Cell: NegativeValueCell,
      accessor: 'profitLoss',
      textAlign: 'right',
      width: theme.spacing(31.75),
    },
  ];

  return {
    columns,
    data: priceExposure.map(({ price, vaultSharePrice }) => {
      const profitLoss = accountVaultShares
        ? vaultSharePrice
            .scale(accountVaultShares.n, accountVaultShares.precision)
            .sub(accountVaultShares.toUnderlying())
        : undefined;
      return {
        price: price.toDisplayStringWithSymbol(3),
        vaultSharePrice: vaultSharePrice.toDisplayStringWithSymbol(3),
        profitLoss: {
          displayValue: profitLoss?.toDisplayStringWithSymbol(3),
          isNegative: profitLoss?.isNegative(),
        },
      };
    }),
  };
};
