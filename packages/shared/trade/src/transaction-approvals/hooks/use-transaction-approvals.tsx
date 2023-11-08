import { useTokenApproval } from './use-token-approval';
import { useEnablePrimeBorrow } from './use-enable-prime-borrow';
import {
  useAccountReady,
  BaseTradeContext,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';

export const useTransactionApprovals = (
  symbol: string,
  context: BaseTradeContext,
  isWithdraw?: boolean
) => {
  const {
    state: { depositBalance, debt },
  } = context;
  const isAccountReady = useAccountReady();
  const {
    tokenStatus,
    isSignerConnected,
    enableToken,
    tokenApprovalTxnStatus,
  } = useTokenApproval(symbol);

  const isDebt =
    debt?.tokenType === 'PrimeDebt' || debt?.tokenType === 'VaultDebt'
      ? true
      : false;

  const { isPrimeBorrowAllowed, enablePrimeBorrow, variableBorrowTxnStatus } =
    useEnablePrimeBorrow();

  const { allowance, insufficientAllowance } = useWalletBalanceInputCheck(
    depositBalance?.token,
    depositBalance
  );

  const variableBorrowApprovalRequired = !isPrimeBorrowAllowed && isDebt;

  const tokenApprovalRequired =
    allowance?.isZero() &&
    !isWithdraw &&
    isAccountReady &&
    isSignerConnected &&
    !!tokenStatus &&
    (tokenStatus.amount.isZero() ||
      (depositBalance && tokenStatus.amount.lt(depositBalance)));

  return {
    enableToken,
    enablePrimeBorrow,
    tokenApprovalTxnStatus,
    variableBorrowTxnStatus,
    tokenApprovalRequired,
    variableBorrowApprovalRequired,
    allowanceApprovalRequired: !allowance?.isZero() && insufficientAllowance,
    showApprovals:
      tokenApprovalRequired ||
      variableBorrowApprovalRequired ||
      insufficientAllowance,
  };
};

export default useTransactionApprovals;
