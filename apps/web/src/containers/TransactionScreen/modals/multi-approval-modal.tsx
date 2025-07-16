import { Box, Divider, useTheme } from '@mui/material';
import { InfoIcon, TokenIcon } from '@notional-finance/icons';
import { Body, Button, LabelValue } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionModal } from './transaction-modal';

// Need the following versions:
// Pending Approval
// All Approvals Successful
// Transaction Pending
// Transaction Failed
// Transaction Success

export const MultiApprovalModal = ({
  isOpen = false,
  onDismiss,
}: {
  isOpen: boolean;
  onDismiss: () => void;
}) => {
  const theme = useTheme();
  const topIcon = (
    <InfoIcon
      sx={{ fontSize: theme.spacing(5) }}
      fill={theme.palette.warning.main}
    />
  );

  return (
    <TransactionModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      topIcon={topIcon}
      title={<FormattedMessage defaultMessage="System Approval" />}
      description={
        <FormattedMessage defaultMessage="Notional requires the following approvals. You will only have to do this once." />
      }
    >
      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
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
            <TokenIcon symbol="USDC" size="medium" />
            <LabelValue>
              <FormattedMessage defaultMessage="USDC Disabled" />
            </LabelValue>
          </Box>
          <Body>
            <FormattedMessage defaultMessage="Enabling a currency is required for Notional to access funds in your wallet." />
          </Body>
        </Box>
        <Button size="small">Enable</Button>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
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
            <TokenIcon symbol="WBTC" size="medium" />
            <LabelValue>
              <FormattedMessage defaultMessage="Morpho Disabled" />
            </LabelValue>
          </Box>
          <Body>
            <FormattedMessage defaultMessage="You must approve Notional to manage your positions on Morpho." />
          </Body>
        </Box>
        <Button size="small">Enable</Button>
      </Box>
    </TransactionModal>
  );
};
