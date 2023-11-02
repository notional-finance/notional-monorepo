import { ReactNode } from 'react';
import { useTheme, Box } from '@mui/material';
import { ErrorMessage } from '../../error-message/error-message';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import { ExternalLink } from '../../external-link/external-link';
import { truncateAddress } from '@notional-finance/helpers';
import { LaunchIcon } from '@notional-finance/icons';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

interface DataTablePendingProps {
  pendingTxns: string[];
  pendingMessage?: ReactNode;
}

export const DataTablePending = ({
  pendingTxns,
  pendingMessage,
}: DataTablePendingProps) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  return (
    <Box sx={{ marginBottom: theme.spacing(3) }}>
      <ErrorMessage
        message={pendingMessage}
        variant="pending"
        sx={{
          margin: 'auto',
          width: '97.5%',
        }}
        marginBottom={true}
      >
        {pendingTxns.map((txn, i) => (
          <ExternalLink
            key={i}
            href={getEtherscanTransactionLink(txn, selectedNetwork)}
            accent
            style={{
              textDecorationColor: theme.palette.typography.accent,
            }}
            textDecoration
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {truncateAddress(txn)}
              <LaunchIcon
                sx={{
                  marginTop: '5px',
                  marginLeft: theme.spacing(1),
                }}
              />
            </Box>
          </ExternalLink>
        ))}
      </ErrorMessage>
    </Box>
  );
};

export default DataTablePending;
