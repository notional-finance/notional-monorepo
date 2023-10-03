import { ReactNode } from 'react';
import { useTheme, Box } from '@mui/material';
import { ErrorMessage } from '../../error-message/error-message';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import { ExternalLink } from '../../external-link/external-link';
import { truncateAddress } from '@notional-finance/helpers';
import { LaunchIcon } from '@notional-finance/icons';

interface DataTablePendingProps {
  pendingTokenData: Record<any, any>;
  pendingMessage?: ReactNode;
}

export const DataTablePending = ({
  pendingTokenData,
  pendingMessage,
}: DataTablePendingProps) => {
  const theme = useTheme();

  return (
    <Box>
      <ErrorMessage
        message={pendingMessage}
        variant="pending"
        sx={{
          margin: 'auto',
          width: '97.5%',
        }}
        marginBottom={true}
      >
        {pendingTokenData.pendingTokens.map(({ network }, index) => (
          <ExternalLink
            key={index}
            href={getEtherscanTransactionLink(
              pendingTokenData.pendingTxns[index],
              network
            )}
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
              {truncateAddress(pendingTokenData.pendingTxns[index])}
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
