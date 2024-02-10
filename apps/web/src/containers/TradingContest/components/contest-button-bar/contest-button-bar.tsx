import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { ReactNode } from 'react';

interface ContestButtonBarProps {
  buttonOnePathTo?: string;
  buttonTwoPathTo?: string;
  buttonOneCallBack?: () => void;
  buttonTwoCallBack?: () => void;
  buttonOneText: ReactNode;
  buttonTwoText: ReactNode;
}

export const ContestButtonBar = ({
  buttonOnePathTo,
  buttonTwoPathTo,
  buttonOneCallBack,
  buttonTwoCallBack,
  buttonOneText,
  buttonTwoText,
}: ContestButtonBarProps) => {
  const theme = useTheme();
  return (
    <ButtonContainer>
      {buttonOneText && (
        <Button
          size="large"
          variant="outlined"
          sx={{
            width: theme.spacing(41.25),
            border: `1px solid ${colors.neonTurquoise}`,
            cursor: 'pointer',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
          to={buttonOnePathTo ? buttonOnePathTo : undefined}
          onClick={() =>
            !buttonOnePathTo && buttonOneCallBack ? buttonOneCallBack() : null
          }
        >
          {buttonOneText}
        </Button>
      )}
      {buttonTwoText && (
        <Button
          size="large"
          sx={{
            width: theme.spacing(41.25),
            fontFamily: 'Avenir Next',
            cursor: 'pointer',
          }}
          to={buttonTwoPathTo ? buttonTwoPathTo : undefined}
          onClick={() =>
            !buttonTwoPathTo && buttonTwoCallBack ? buttonTwoCallBack() : null
          }
        >
          {buttonTwoText}
        </Button>
      )}
    </ButtonContainer>
  );
};

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(6)}; 
  margin: 0px auto;
  ${theme.breakpoints.down('md')} {
    flex-direction: column;
  }
  `
);

export default ContestButtonBar;
