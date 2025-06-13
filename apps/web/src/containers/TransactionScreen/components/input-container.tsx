import { Box, styled } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';

interface InputContainerProps {
  children: React.ReactNode | React.ReactNode[];
  infoTextRow?: React.ReactNode;
}

// Input Container Component
const InputContainer = ({ children, infoTextRow }: InputContainerProps) => {
  return (
    <InputContainerWrapper>
      <Box>{infoTextRow}</Box>
      {children}

      <TradeActionButton
        canSubmit={true}
        onSubmit={() => {
          console.log('submit');
        }}
      />
    </InputContainerWrapper>
  );
};

const InputContainerWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex: 2;
  width: 100%;
  background-color: ${theme.palette.background.paper};
  padding: ${theme.spacing(3)};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: ${theme.shape.borderRadius()};
  `
);

export default InputContainer;
