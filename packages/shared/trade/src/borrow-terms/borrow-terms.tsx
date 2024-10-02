import { Caption, CountUp, H4, H5 } from '@notional-finance/mui';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { useBorrowTerms } from './use-borrow-terms';
import { Box, Checkbox, styled, useTheme } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

interface BorrowTermsProps {
  context: BaseTradeContext;
}

export const BorrowTerms = ({ context }: BorrowTermsProps) => {
  const theme = useTheme();
  const {
    state: { debt },
  } = context;
  const { borrowOptions, onSelect } = useBorrowTerms(context);

  return (
    <div>
      {borrowOptions.map((option, i) => {
        const isSelected = option.token.id === debt?.id;
        return (
          <Box key={i}>
            {i === 1 && (
              <H5 sx={{ paddingBottom: theme.spacing(1) }}>
                {option.optionTitle}
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
                <H4>
                  <CountUp
                    value={option.largeCaption}
                    suffix={option?.largeCaptionSuffix}
                    decimals={option?.largeCaptionDecimals || 2}
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
                  <CountUp
                    value={option.largeFigure}
                    suffix={option.largeFigureSuffix}
                    decimals={option.largeFigureDecimals || 2}
                  />
                </Box>
                <Caption>{option.caption}</Caption>
              </Box>
            </BorrowTermsButton>
          </Box>
        );
      })}
    </div>
  );
};

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

export default BorrowTerms;
