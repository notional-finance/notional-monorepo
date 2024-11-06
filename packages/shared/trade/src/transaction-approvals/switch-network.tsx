import { useTheme, Divider, Box } from '@mui/material';
import { StatusHeading } from '../transaction-confirmation/components/status-heading';
import { Button, ScrollToTop } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionStatus } from '@notional-finance/notionable-hooks';
import { TermsOfService } from '../transaction-confirmation/transaction-confirmation';
import { ApprovalButton } from './components/approval-button';
import { messages } from './messages';
import {
  getNetworkSymbol,
  getNetworkTitle,
  Network,
} from '@notional-finance/util';
import { useChangeNetwork } from './hooks/use-change-network';
import { useState } from 'react';

export interface SwitchNetworkProps {
  selectedNetwork: Network | undefined;
  hideDrawer?: boolean;
  onCancel?: () => void;
}

export const SwitchNetwork = ({
  onCancel,
  hideDrawer,
  selectedNetwork,
}: SwitchNetworkProps) => {
  const theme = useTheme();
  const [isPending, setPending] = useState(false);
  const { changeNetwork } = useChangeNetwork(selectedNetwork);
  const approvalButton = (
    <ApprovalButton
      symbol={getNetworkSymbol(selectedNetwork)}
      showIconOnly
      showSymbol={false}
      callback={() => {
        if (selectedNetwork) {
          setPending(true);
          changeNetwork(selectedNetwork, () => setPending(false));
        }
      }}
      description={messages.switchNetwork.description}
      title={messages.switchNetwork.title}
      buttonText={messages.switchNetwork.buttonText}
      pending={isPending}
      descriptionValues={{ network: getNetworkTitle(selectedNetwork) }}
    />
  );

  return hideDrawer ? (
    approvalButton
  ) : (
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
      {approvalButton}
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
