import { Box, styled, useTheme } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';
import { observer } from 'mobx-react-lite';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

interface InputContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const InputContainer = observer(({ children }: InputContainerProps) => {
  const theme = useTheme();
  const context = useCurrentTradeContext();

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
          canSubmit={context?.canSubmit() ?? false}
          onSubmit={() => {
            // This triggers all of the approval and transaction logic
            context?.setConfirm(true);
            // submit();
            // setIsTransactionModalOpen(true);
          }}
        />
      </Box>
      {/* <ApprovalModal
        isOpen={isApprovalModalOpen}
        onDismiss={() => setIsApprovalModalOpen(false)}
        onApprove={() => {
          approveRouter(true);
        }}
      />
      <PendingTransactionModal
        isOpen={isTransactionModalOpen}
        onDismiss={() => setIsTransactionModalOpen(false)}
        hash={transactionHash}
        transactionStatus={transactionStatus}
        selectedNetwork={context?.selectedNetwork}
        errorMsg={error}
      /> */}
    </InputContainerWrapper>
  );
});

const InputContainerWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex: 1;
  width: 100%;
  min-height: 100%;
  background-color: ${theme.palette.background.paper};
  padding: ${theme.spacing(3)};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: ${theme.shape.borderRadius()};
  `
);

export default InputContainer;
