import { useEffect, useState } from 'react';
import { Box, Divider, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Body, Button, LabelValue } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionModal } from './transaction-modal';
import { TransactionStatus } from '@notional-finance/util';
import { useWalletStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

export const MultiApprovalModal = observer(
  ({
    isOpen = false,
    tokenSymbol,
    enableToken,
    approveRouter,
    onDismiss,
  }: {
    isOpen: boolean;
    tokenSymbol: string | undefined;
    enableToken: (() => void) | undefined;
    approveRouter: (() => void) | undefined;
    onDismiss: () => void;
  }) => {
    const theme = useTheme();
    const { transactionStatus } = useWalletStore();
    const [_isEnablePending, setIsEnablePending] = useState(false);
    const [_isApprovePending, setIsApprovePending] = useState(false);
    const isTransactionPending =
      transactionStatus === TransactionStatus.WAIT_USER_CONFIRM ||
      transactionStatus === TransactionStatus.SUBMITTED;

    const isEnablePending = _isEnablePending && isTransactionPending;
    const isApprovePending = _isApprovePending && isTransactionPending;

    useEffect(() => {
      if (!isTransactionPending) {
        setIsEnablePending(false);
        setIsApprovePending(false);
      }
    }, [isTransactionPending]);

    return (
      <TransactionModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        transactionStatus={transactionStatus || TransactionStatus.NONE}
        title={<FormattedMessage defaultMessage="System Approval" />}
        description={
          <FormattedMessage defaultMessage="Notional requires the following approvals. You will only have to do this once." />
        }
      >
        {enableToken && (
          <>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                  }}
                >
                  <TokenIcon symbol={tokenSymbol ?? ''} size="medium" />
                  <LabelValue>{tokenSymbol} Disabled</LabelValue>
                </Box>
                <Body>
                  <FormattedMessage defaultMessage="Enabling a currency is required for Notional to access funds in your wallet." />
                </Body>
              </Box>
              <Button
                size="small"
                disabled={isEnablePending}
                onClick={() => {
                  setIsEnablePending(true);
                  enableToken();
                }}
              >
                <FormattedMessage defaultMessage="Enable" />
              </Button>
            </Box>
          </>
        )}
        {approveRouter && (
          <>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                  }}
                >
                  <TokenIcon symbol="MORPHO" size="medium" />
                  <LabelValue>
                    <FormattedMessage defaultMessage="Morpho Disabled" />
                  </LabelValue>
                </Box>
                <Body>
                  <FormattedMessage defaultMessage="You must approve Notional to manage your positions on Morpho." />
                </Body>
              </Box>
              <Button
                size="small"
                disabled={isApprovePending}
                onClick={() => {
                  setIsApprovePending(true);
                  approveRouter();
                }}
              >
                <FormattedMessage defaultMessage="Enable" />
              </Button>
            </Box>
          </>
        )}
      </TransactionModal>
    );
  }
);
