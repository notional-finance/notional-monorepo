import { Box, styled, useTheme } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';
import { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PendingTransactionModal } from '../modals/pending-transaction';
import { TransactionStatus } from '@notional-finance/util';
import {
  useCurrentTradeContext,
  useSubmitTxn,
  useWalletStore,
} from '@notional-finance/notionable-hooks';

interface InputContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const useTriggerSubmit = () => {
  const trade = useCurrentTradeContext();
  const submitTxn = useSubmitTxn();
  const tradeType = trade?.tradeType;
  const selectedNetwork = trade?.selectedNetwork;
  const { userWallet, setTransactionStatus } = useWalletStore();
  const [error, setTransactionError] = useState<string | undefined>();

  const submit = useCallback(() => {
    if (tradeType && selectedNetwork && userWallet) {
      trade
        .buildTransaction()
        .then(({ populatedTransaction, transactionError }) => {
          if (populatedTransaction) {
            submitTxn(tradeType, populatedTransaction);
          } else {
            setTransactionStatus(TransactionStatus.ERROR_BUILDING);
            setTransactionError(
              transactionError || 'Error building transaction'
            );
          }
        });
    }
  }, [tradeType, selectedNetwork, userWallet, trade, submitTxn]);

  return { submit, error };
};

const InputContainer = observer(({ children }: InputContainerProps) => {
  const theme = useTheme();
  const context = useCurrentTradeContext();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const { submit, error } = useTriggerSubmit();
  const { transactionStatus, transactionHash } = useWalletStore();

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
            context?.setConfirm(true);
            submit();
            setIsApprovalModalOpen(true);
          }}
        />
      </Box>
      <PendingTransactionModal
        isOpen={isApprovalModalOpen}
        onDismiss={() => setIsApprovalModalOpen(false)}
        hash={transactionHash}
        transactionStatus={transactionStatus}
        selectedNetwork={context?.selectedNetwork}
        errorMsg={error}
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
