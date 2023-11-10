import { useTokenApproval } from './use-token-approval';
import { useEnablePrimeBorrow } from './use-enable-prime-borrow';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  useAccountReady,
  BaseTradeContext,
} from '@notional-finance/notionable-hooks';

export const useTransactionApprovals = (
  context: BaseTradeContext,
  requiredApprovalAmount?: TokenBalance,
  variableBorrowRequired?: boolean
) => {
  const {
    state: { depositBalance, selectedDepositToken },
  } = context;
  const isAccountReady = useAccountReady();
  const {
    tokenStatus,
    isSignerConnected,
    enableToken,
    tokenApprovalTxnStatus,
  } = useTokenApproval(selectedDepositToken || '');

  const { isPrimeBorrowAllowed, enablePrimeBorrow, variableBorrowTxnStatus } =
    useEnablePrimeBorrow();

  const variableBorrowApprovalRequired =
    !isPrimeBorrowAllowed && variableBorrowRequired;

  const approvalRequired =
    requiredApprovalAmount ||
    (depositBalance?.isPositive() ? depositBalance : undefined);

  const insufficientAllowance =
    approvalRequired && tokenStatus && tokenStatus.amount.lt(approvalRequired);

  const tokenApprovalRequired =
    isAccountReady &&
    isSignerConnected &&
    insufficientAllowance &&
    tokenStatus &&
    tokenStatus.amount.isZero();

  const allowanceIncreaseRequired =
    insufficientAllowance && tokenStatus && tokenStatus.amount.isPositive();

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
