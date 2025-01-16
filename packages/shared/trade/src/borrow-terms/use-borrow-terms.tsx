import { useCallback } from 'react';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import { leveragedYield } from '@notional-finance/util';
import { TokenDefinition } from '@notional-finance/core-entities';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';

export const useBorrowTerms = (priorVaultFactors?: {
  vaultShare?: TokenDefinition;
  vaultBorrowRate?: number;
  leverageRatio?: number;
}) => {
  const trade = useCurrentTradeContext();
  const { collateral } = trade?.selectedTokens || {};
  const { debt: debtOptions, collateral: collateralOptions } =
    trade?.computedOptions ?? {};
  const { debt: availableDebtTokens } = trade?.availableTokens ?? {};
  const _leverageRatio = trade?.leverageRatio;

  const assetAPY = collateralOptions?.find(
    (c) => c.token.id === collateral?.id
  )?.interestRate;

  const leverageRatio = _leverageRatio
    ? _leverageRatio
    : priorVaultFactors?.leverageRatio;

  // First sort options by maturity ascending
  const borrowOptions =
    debtOptions
      ?.slice()
      .sort((a, b) => {
        return (
          (a.token.maturity === undefined ||
          a.token.maturity === PRIME_CASH_VAULT_MATURITY
            ? 0
            : a.token.maturity) -
          (b.token.maturity === undefined ||
          b.token.maturity === PRIME_CASH_VAULT_MATURITY
            ? 0
            : b.token.maturity)
        );
      })
      .map((o, index) => {
        const borrowRate = o?.interestRate;
        const totalAPY = leveragedYield(assetAPY, borrowRate, leverageRatio);
        return {
          error:
            o?.error === 'Error: Insufficient Liquidity' ? (
              <FormattedMessage defaultMessage={'Insufficient Liquidity'} />
            ) : o?.error ? (
              <FormattedMessage defaultMessage={'Error'} />
            ) : undefined,
          optionTitle:
            index === 0 ? (
              <FormattedMessage defaultMessage={'Variable Rate'} />
            ) : o?.token.maturity && index === 1 ? (
              <FormattedMessage defaultMessage={'Fixed Rate'} />
            ) : undefined,
          token: o?.token,
          largeCaption: totalAPY ? totalAPY : undefined,
          largeCaptionDecimals: 2,
          largeCaptionSuffix: '% Total APY',
          largeFigure: borrowRate,
          largeFigureDecimals: 2,
          largeFigureSuffix: `% Borrow APY`,
          caption:
            o?.token.maturity && !o?.token?.symbol.includes('open') ? (
              <Box>
                <FormattedMessage defaultMessage={'Fixed:'} />{' '}
                {formatMaturity(o?.token.maturity)}
              </Box>
            ) : (
              <FormattedMessage defaultMessage={'Variable'} />
            ),
        };
      }) || [];

  const onSelect = useCallback(
    (selectedId: string | null) => {
      const debt = availableDebtTokens?.find((t) => t.id === selectedId);
      if (!trade || !debt) return;
      if (trade.vaultAddress) trade.setVaultDebtByID(debt.id);
      else trade.setDebtByID(debt.id, false);
    },
    [availableDebtTokens, trade]
  );

  return { borrowOptions, onSelect };
};
