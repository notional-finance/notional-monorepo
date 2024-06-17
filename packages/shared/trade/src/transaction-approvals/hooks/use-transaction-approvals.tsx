import { useTokenApproval } from './use-token-approval';
import { useEnablePrimeBorrow } from './use-enable-prime-borrow';
import { TokenBalance } from '@notional-finance/core-entities';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';

export const useTransactionApprovals = (
  context: BaseTradeContext,
  requiredApprovalAmount?: TokenBalance,
  variableBorrowRequired?: boolean
) => {
  const {
    state: {
      depositBalance,
      deposit,
      selectedNetwork,
      secondaryDepositBalance,
    },
  } = context;
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

  const { isPrimeBorrowAllowed, enablePrimeBorrow, variableBorrowTxnStatus } =
    useEnablePrimeBorrow(selectedNetwork);

  const variableBorrowApprovalRequired =
    !isPrimeBorrowAllowed && variableBorrowRequired;

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
    enablePrimeBorrow,
    secondaryEnableToken,
    tokenApprovalTxnStatus,
    secondaryTokenApprovalTxnStatus,
    variableBorrowTxnStatus,
    tokenApprovalRequired,
    secondaryTokenApprovalRequired,
    variableBorrowApprovalRequired,
    allowanceIncreaseRequired,
    showApprovals:
      tokenApprovalRequired ||
      variableBorrowApprovalRequired ||
      allowanceIncreaseRequired ||
      secondaryTokenApprovalRequired,
  };
};

export default useTransactionApprovals;
