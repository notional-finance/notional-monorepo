import { InfoIcon } from '@notional-finance/icons';
import { TransactionModal } from './transaction-modal';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { Button } from '@notional-finance/mui';

export const SingleApprovalModal = ({
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
      title={<FormattedMessage defaultMessage="USDC Disabled" />}
      description={
        <FormattedMessage defaultMessage="Enabling a currency is required for Notional to access funds in your wallet. You will only have to do this once." />
      }
    >
      <Button sx={{ width: '100%' }} size="large">
        Enable USDC
      </Button>
    </TransactionModal>
  );
};
