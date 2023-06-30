import { TokenApproval } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import {
  TransactionStatus,
  useAccountReady,
} from '@notional-finance/notionable-hooks';
import { useTokenApproval } from './use-token-approval';
import { TokenBalance } from '@notional-finance/core-entities';

interface TokenApprovalViewProps {
  symbol: string;
  requiredAmount?: TokenBalance;
}

export const TokenApprovalView = ({
  symbol,
  requiredAmount,
}: TokenApprovalViewProps) => {
  const theme = useTheme();
  const isAccountReady = useAccountReady();
  const { tokenStatus, enableToken, transactionStatus, isSignerConnected } =
    useTokenApproval(symbol);

  const approvalRequired =
    isAccountReady &&
    isSignerConnected &&
    tokenStatus &&
    (tokenStatus.amount.isZero() ||
      (requiredAmount && tokenStatus.amount.lt(requiredAmount)));

  return (
    <Box>
      {approvalRequired && (
        <TokenApproval
          symbol={symbol}
          approved={!approvalRequired}
          success={transactionStatus === TransactionStatus.CONFIRMED}
          approvalPending={transactionStatus === TransactionStatus.PENDING}
          error={transactionStatus === TransactionStatus.REVERT}
          onChange={() => enableToken(true)}
          sx={{
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(2),
          }}
        />
      )}
    </Box>
  );
};

export default TokenApprovalView;
