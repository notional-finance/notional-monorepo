import { useTheme, Divider, Box } from '@mui/material';
import { StatusHeading } from '../transaction-confirmation/components/status-heading';
import { Button, ScrollToTop } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  TransactionStatus,
  BaseTradeContext,
} from '@notional-finance/notionable-hooks';
import { TermsOfService } from '../transaction-confirmation/transaction-confirmation';
import { ApprovalButton } from './components/approval-button';
import { messages } from './messages';
import { getNetworkSymbol, getNetworkTitle } from '@notional-finance/util';
import { useChangeNetwork } from './hooks/use-change-network';
import { useState } from 'react';

export interface SwitchNetworkProps {
  context: BaseTradeContext;
  onCancel?: () => void;
}

export const SwitchNetwork = ({ context, onCancel }: SwitchNetworkProps) => {
  const theme = useTheme();
  const {
    state: { selectedNetwork },
  } = context;
  const [isPending, setPending] = useState(false);
  const onSwitch = useChangeNetwork();

  return (
    <Box sx={{ minHeight: '80vh' }}>
      <ScrollToTop />
      <StatusHeading
        heading={<FormattedMessage defaultMessage={'SWITCH NETWORK'} />}
        transactionStatus={TransactionStatus.APPROVAL_PENDING}
      />
      <TermsOfService theme={theme}>
        {
          <FormattedMessage
            defaultMessage={
              'This transaction requires your wallet to be connected to {selectedNetwork}.'
            }
            values={{ selectedNetwork }}
          />
        }
      </TermsOfService>
      <Divider
        variant="fullWidth"
        sx={{ background: 'white', marginBottom: theme.spacing(6) }}
      />
      <ApprovalButton
        symbol={getNetworkSymbol(selectedNetwork)}
        showIconOnly
        showSymbol={false}
        callback={() => {
          if (selectedNetwork) {
            setPending(true);
            onSwitch(selectedNetwork);
          }
        }}
        description={messages.switchNetwork.description}
        title={messages.switchNetwork.title}
        buttonText={messages.switchNetwork.buttonText}
        pending={isPending}
        descriptionValues={{ network: getNetworkTitle(selectedNetwork) }}
      />
      <Button
        variant="outlined"
        size="large"
        sx={{
          bottom: 0,
          position: 'fixed',
          width: '447px',
          marginBottom: theme.spacing(4),
        }}
        onClick={onCancel}
      >
        <FormattedMessage defaultMessage={'Back'} />
      </Button>
    </Box>
  );
};
