import { Caption, CountUp, H4, H5 } from '@notional-finance/mui';
import { Box, Checkbox, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatMaturity } from '@notional-finance/util';

export const LeveragedBorrowTerms = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { debt } = trade?.selectedTokens || {};
  const { leverageOptions } = trade?.getLeverageOptions() ?? {};

  const onSelect = useCallback(
    (selectedId: string | null) => {
      if (!trade || !selectedId) return;
      if (trade.vaultAddress) trade.setVaultDebtByID(selectedId);
      else trade.setDebtByID(selectedId, false);
    },
    [trade]
  );

  return (
    <Box>
      {leverageOptions?.map((option, i) => {
        const isSelected = option.debt.token.id === debt?.id;
        const termLabel = option.isVariableRate ? (
          <FormattedMessage defaultMessage={'Variable Rate'} />
        ) : (
          <FormattedMessage defaultMessage={'Fixed Rate'} />
        );
        const errorMessage =
          option.error === 'Error: Insufficient Liquidity' ? (
            <FormattedMessage defaultMessage={'Insufficient Liquidity'} />
          ) : option.error ? (
            <FormattedMessage defaultMessage={'Error'} />
          ) : undefined;

        return (
          <Box key={option.debt.token.id}>
            {i === 1 && (
              <H5 sx={{ paddingBottom: theme.spacing(1) }}>{termLabel}</H5>
            )}
            <BorrowTermsButton
              theme={theme}
              isSelected={isSelected}
              key={i}
              onClick={() => onSelect(option.debt.token.id)}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '.MuiButtonBase-root': {
                    paddingLeft: '0px',
                  },
                }}
              >
                <Checkbox
                  sx={{
                    color: theme.palette.borders.paper,
                    fill: theme.palette.common.white,
                    '&.Mui-checked': {
                      color: theme.palette.typography.accent,
                    },
                  }}
                  checked={isSelected}
                />
                {/* This is the total apy */}
                <H4>
                  {errorMessage ? (
                    errorMessage
                  ) : (
                    <CountUp
                      value={option.totalAPY}
                      suffix={'% Total APY'}
                      decimals={2}
                    />
                  )}
                </H4>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'end',
                }}
              >
                <Box
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.typography.main,
                    visibility: errorMessage ? 'hidden' : 'visible',
                  }}
                >
                  <CountUp
                    value={option.debtAPY}
                    suffix={`% Borrow APY`}
                    decimals={2}
                  />
                </Box>
                <Caption>
                  {option.isVariableRate ? (
                    <FormattedMessage defaultMessage={'Variable'} />
                  ) : (
                    <Box>
                      <FormattedMessage defaultMessage={'Fixed:'} />{' '}
                      {formatMaturity(option.debt.token.maturity ?? 0)}
                    </Box>
                  )}
                </Caption>
              </Box>
            </BorrowTermsButton>
          </Box>
        );
      })}
    </Box>
  );
});

const BorrowTermsButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'isSelected',
})(
  ({ theme, isSelected }: { isSelected: boolean; theme: NotionalTheme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing(1, 2)};
  margin-bottom: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    isSelected ? theme.palette.typography.accent : theme.palette.borders.paper
  };
  cursor: pointer;
  background: ${
    isSelected ? theme.palette.info.light : theme.palette.common.white
  };
  &:hover {
    transition: .5s ease;
    background: ${theme.palette.info.light};
  }
  `
);

export default LeveragedBorrowTerms;
