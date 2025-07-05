import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { useTokenApproval } from './use-token-approval';
import { TokenBalance } from '@notional-finance/core-entities';

export const useTransactionApprovals = (
  requiredApprovalAmount?: TokenBalance
) => {
  const trade = useCurrentTradeContext();
  const deposit = trade?.selectedTokens?.deposit;
  const selectedNetwork = trade?.selectedNetwork;
  const depositBalance = trade?.depositBalance;
  const secondaryDepositBalance = trade?.secondaryDepositBalance;
  const {
    tokenStatus,
    isSignerConnected,
    enableToken,
    tokenApprovalTxnStatus,
  } = useTokenApproval(deposit?.symbol || '', selectedNetwork);

  const {
    tokenStatus: secondaryTokenStatus,
    isSignerConnected: secondaryIsSignerConnected,
    enableToken: secondaryEnableToken,
    tokenApprovalTxnStatus: secondaryTokenApprovalTxnStatus,
  } = useTokenApproval(secondaryDepositBalance?.symbol || '', selectedNetwork);

  const approvalRequired =
    requiredApprovalAmount ||
    (depositBalance?.isPositive() ? depositBalance : undefined);

  const secondaryApprovalRequired =
    requiredApprovalAmount ||
    (secondaryDepositBalance?.isPositive()
      ? secondaryDepositBalance
      : undefined);

  const insufficientAllowance =
    approvalRequired && tokenStatus && tokenStatus.amount.lt(approvalRequired);

  const secondaryInsufficientAllowance =
    secondaryApprovalRequired &&
    secondaryTokenStatus &&
    secondaryTokenStatus.amount.lt(secondaryApprovalRequired);

  const tokenApprovalRequired =
    !!isSignerConnected &&
    insufficientAllowance === true &&
    tokenStatus?.amount.isZero() === true;

  const secondaryTokenApprovalRequired =
    !!secondaryIsSignerConnected &&
    secondaryInsufficientAllowance === true &&
    secondaryTokenStatus?.amount.isZero() === true;

  const allowanceIncreaseRequired =
    !!isSignerConnected &&
    insufficientAllowance === true &&
    tokenStatus?.amount.isPositive() === true;

  return {
    enableToken,
    secondaryEnableToken,
    tokenApprovalTxnStatus,
    secondaryTokenApprovalTxnStatus,
    tokenApprovalRequired,
    secondaryTokenApprovalRequired,
    allowanceIncreaseRequired,
    showApprovals:
      tokenApprovalRequired ||
      allowanceIncreaseRequired ||
      secondaryTokenApprovalRequired,
  };
};

export default useTransactionApprovals;
