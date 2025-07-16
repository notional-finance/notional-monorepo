import { Box, styled, useTheme } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SingleApprovalModal } from '../modals/single-approval';

interface InputContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const InputContainer = observer(({ children }: InputContainerProps) => {
  const theme = useTheme();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  return (
    <InputContainerWrapper>
      <Box
        sx={{
          width: '100%',
          gap: theme.spacing(5),
          justifyContent: 'space-between',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <TradeActionButton
          canSubmit={true}
          onSubmit={() => {
            setIsApprovalModalOpen(true);
          }}
        />
      </Box>
      <SingleApprovalModal
        isOpen={isApprovalModalOpen}
        onDismiss={() => setIsApprovalModalOpen(false)}
      />
    </InputContainerWrapper>
  );
});

const InputContainerWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex: 2;
  width: 100%;
  min-height: 100%;
  background-color: ${theme.palette.background.paper};
  padding: ${theme.spacing(3)};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: ${theme.shape.borderRadius()};
  `
);

export default InputContainer;
