import { useCallback } from 'react';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { formatMaturity } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';

export const useLeveragedBorrowTerms = () => {
  const trade = useCurrentTradeContext();
  const { leverageOptions } = trade?.getLeverageOptions() ?? {};

  // First sort options by maturity ascending
  const borrowOptions =
    leverageOptions?.map((o) => {
      return {
        error:
          o.error === 'Error: Insufficient Liquidity' ? (
            <FormattedMessage defaultMessage={'Insufficient Liquidity'} />
          ) : o.error ? (
            <FormattedMessage defaultMessage={'Error'} />
          ) : undefined,
        termLabel: o.isVariableRate ? (
          <FormattedMessage defaultMessage={'Variable Rate'} />
        ) : (
          <FormattedMessage defaultMessage={'Fixed Rate'} />
        ),
        token: o.debt.token,
        totalAPY: o.totalAPY,
        totalAPYDecimals: 2,
        totalAPYSuffix: '% Total APY',
        borrowAPY: o.debtAPY,
        borrowAPYDecimals: 2,
        borrowAPYSuffix: `% Borrow APY`,
        termCaption: o.isVariableRate ? (
          <FormattedMessage defaultMessage={'Variable'} />
        ) : (
          <Box>
            <FormattedMessage defaultMessage={'Fixed:'} />{' '}
            {formatMaturity(o.debt.token.maturity ?? 0)}
          </Box>
        ),
      };
    }) || [];

  const onSelect = useCallback(
    (selectedId: string | null) => {
      if (!trade || !selectedId) return;
      if (trade.vaultAddress) trade.setVaultDebtByID(selectedId);
      else trade.setDebtByID(selectedId, false);
    },
    [trade]
  );

  return { borrowOptions, onSelect };
};
