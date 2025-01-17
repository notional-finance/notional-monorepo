import { Caption, CountUp, H4, H5 } from '@notional-finance/mui';
import { useLeveragedBorrowTerms } from './use-leveraged-borrow-terms';
import { Box, Checkbox, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

export const LeveragedBorrowTerms = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { debt } = trade?.selectedTokens || {};
  const { borrowOptions, onSelect } = useLeveragedBorrowTerms();

  return (
    <Box>
      {borrowOptions.map((option, i) => {
        const isSelected = option.token.id === debt?.id;

        return (
          <Box key={option.token.id}>
            {/* TODO: this is some ugly code */}
            {i === 1 && (
              <H5 sx={{ paddingBottom: theme.spacing(1) }}>
                {option.termLabel}
              </H5>
            )}
            <BorrowTermsButton
              theme={theme}
              isSelected={isSelected}
              key={i}
              onClick={() => onSelect(option.token.id)}
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
                  <CountUp
                    value={option.totalAPY}
                    suffix={option.totalAPYSuffix}
                    decimals={option.totalAPYDecimals || 2}
                  />
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
                  sx={{ fontWeight: 600, color: theme.palette.typography.main }}
                >
                  {/* This is the borrow apy */}
                  <CountUp
                    value={option.borrowAPY}
                    suffix={option.borrowAPYSuffix}
                    decimals={option.borrowAPYDecimals || 2}
                  />
                </Box>
                <Caption>{option.termCaption}</Caption>
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
