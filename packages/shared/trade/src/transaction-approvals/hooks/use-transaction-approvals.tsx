import {
  useCurrentTradeContext,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { useTokenApproval } from './use-token-approval';
import { TokenBalance } from '@notional-finance/core-entities';

export const useTransactionApprovals = (
  spender?: string,
  requiredApprovalAmount?: TokenBalance
) => {
  const trade = useCurrentTradeContext();
  const deposit = trade?.selectedTokens?.deposit;
  const selectedNetwork = trade?.selectedNetwork;
  const depositBalance = trade?.depositBalance;
  const secondaryDepositBalance = trade?.secondaryDepositBalance;
  const { tokenStatus, enableToken } = useTokenApproval(
    deposit?.symbol || '',
    spender,
    selectedNetwork
  );
  const { userWallet } = useWalletStore();
  const isSignerConnected = userWallet && !userWallet.isReadOnlyAddress;

  const {
    tokenStatus: secondaryTokenStatus,
    enableToken: secondaryEnableToken,
  } = useTokenApproval(
    secondaryDepositBalance?.symbol || '',
    spender,
    selectedNetwork
  );

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
    (insufficientAllowance === true || tokenStatus?.amount.isZero() === true);

  const secondaryTokenApprovalRequired =
    !!isSignerConnected &&
    secondaryInsufficientAllowance === true &&
    secondaryTokenStatus?.amount.isZero() === true;

  const allowanceIncreaseRequired =
    !!isSignerConnected &&
    insufficientAllowance === true &&
    tokenStatus?.amount.isPositive() === true;

  return {
    enableToken,
    secondaryEnableToken,
    tokenApprovalRequired,
    secondaryTokenApprovalRequired,
    allowanceIncreaseRequired,
  };
};

export default useTransactionApprovals;
