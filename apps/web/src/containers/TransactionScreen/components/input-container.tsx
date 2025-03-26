import { Box, styled, useTheme } from '@mui/material';
import { Button } from '@notional-finance/mui';

interface InputContainerProps {
  children: React.ReactNode;
  infoTextRow: React.ReactNode;
  button: {
    enabled: boolean;
    text: string;
    onClick: () => void;
  };
  balance?: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  onMaxClick?: () => void;
  onTokenSelect?: () => void;
  amount?: string;
  onAmountChange?: (value: string) => void;
  lendingOptions?: Array<{
    title: string;
    value: string;
    date?: string;
    onClick?: () => void;
  }>;
}

// Input Container Component
const InputContainer = ({
  children,
  button,
  infoTextRow,
}: InputContainerProps) => {
  const theme = useTheme();
  return (
    <InputContainerWrapper>
      <Box>{infoTextRow}</Box>
      <Box sx={{ width: '100%', marginBottom: theme.spacing(10) }}>
        {children}
      </Box>

      <Button
        variant="contained"
        disabled={!button.enabled}
        onClick={button.onClick}
        fullWidth
        size="large"
      >
        {button.text}
      </Button>
    </InputContainerWrapper>
  );
};

const InputContainerWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing(2)};
  flex: 2;
  width: 100%;
  background-color: ${theme.palette.background.paper};
  padding: ${theme.spacing(2.5)};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: ${theme.shape.borderRadius()};
  `
);

export default InputContainer;
