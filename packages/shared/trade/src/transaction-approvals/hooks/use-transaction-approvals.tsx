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
    state: { depositBalance, selectedDepositToken, selectedNetwork },
  } = context;
  const {
    tokenStatus,
    isSignerConnected,
    enableToken,
    tokenApprovalTxnStatus,
  } = useTokenApproval(selectedDepositToken || '', selectedNetwork);

  const { isPrimeBorrowAllowed, enablePrimeBorrow, variableBorrowTxnStatus } =
    useEnablePrimeBorrow(selectedNetwork);

  const variableBorrowApprovalRequired =
    !isPrimeBorrowAllowed && variableBorrowRequired;

  const approvalRequired =
    requiredApprovalAmount ||
    (depositBalance?.isPositive() ? depositBalance : undefined);

  const insufficientAllowance =
    approvalRequired && tokenStatus && tokenStatus.amount.lt(approvalRequired);

  const tokenApprovalRequired =
    !!isSignerConnected &&
    insufficientAllowance === true &&
    tokenStatus?.amount.isZero() === true;

  const allowanceIncreaseRequired =
    !!isSignerConnected &&
    insufficientAllowance === true &&
    tokenStatus?.amount.isPositive() === true;

  return {
    enableToken,
    enablePrimeBorrow,
    tokenApprovalTxnStatus,
    variableBorrowTxnStatus,
    tokenApprovalRequired,
    variableBorrowApprovalRequired,
    allowanceIncreaseRequired,
    showApprovals:
      tokenApprovalRequired ||
      variableBorrowApprovalRequired ||
      allowanceIncreaseRequired,
  };
};

export default useTransactionApprovals;
