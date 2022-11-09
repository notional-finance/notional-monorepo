import { TokenApproval } from '@notional-finance/mui';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useWallet } from '@notional-finance/notionable-hooks';
import { useTokenApproval } from './use-token-approval';

interface TokenApprovalViewProps {
  symbol?: string;
}

export const TokenApprovalView = ({ symbol }: TokenApprovalViewProps) => {
  const { walletConnected } = useWallet();
  const { currency } = useParams<Record<string, string>>();
  const { tokenStatus, enableToken } = useTokenApproval(symbol || currency);

  return (
    <Box>
      {!!tokenStatus && tokenStatus !== 'APPROVED' && walletConnected && (
        <TokenApproval
          symbol={symbol || currency}
          approved={tokenStatus === 'SUCCESS'}
          success={tokenStatus === 'SUCCESS'}
          approvalPending={tokenStatus === 'PENDING'}
          error={tokenStatus === 'ERROR'}
          onChange={enableToken}
          sx={{
            marginBottom: '1rem',
            marginTop: '1rem',
          }}
        />
      )}
    </Box>
  );
};

export default TokenApprovalView;
