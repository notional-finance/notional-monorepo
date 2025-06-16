import { Box, styled } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';

interface InputContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const InputContainer = ({ children }: InputContainerProps) => {
  return (
    <InputContainerWrapper>
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
  align-items: flex-start;
  justify-content: flex-start;
  flex: 2;
  width: 100%;
  background-color: ${theme.palette.background.paper};
  padding: ${theme.spacing(3)};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: ${theme.shape.borderRadius()};
  gap: ${theme.spacing(5)};
  `
);

export default InputContainer;
