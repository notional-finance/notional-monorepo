import { useCallback, useMemo } from 'react';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { formatMaturity } from '@notional-finance/util';
import { leveragedYield } from '@notional-finance/util';
import { TokenDefinition } from '@notional-finance/core-entities';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const assetAPY = collateralOptions?.find(
    (c) => c.token.id === collateral?.id
  )?.interestRate;

  const leverageRatio = _leverageRatio
    ? _leverageRatio
    : priorVaultFactors?.leverageRatio;

  const borrowOptions = useMemo(() => {
    // First sort options by maturity
    const formattedOptions =
      debtOptions?.slice().sort((a, b) => {
        if (a?.token?.maturity && b?.token?.maturity) {
          return a.token.maturity - b.token.maturity;
        } else {
          return 0;
        }
      }) || [];

    return formattedOptions.map((o, index) => {
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
    });
  }, [debtOptions, leverageRatio, assetAPY]);

  const onSelect = useCallback(
    (selectedId: string | null) => {
      const debt = availableDebtTokens?.find((t) => t.id === selectedId);
      navigate(`${pathname}?borrowOption=${debt?.id}`);
    },
    [availableDebtTokens, navigate, pathname]
  );

  return { borrowOptions, onSelect };
};
