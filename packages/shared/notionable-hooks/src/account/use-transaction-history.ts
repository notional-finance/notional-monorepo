import { useAccount } from './use-account';

export function useTransactionHistory() {
  const { accountDataCopy } = useAccount();
  return accountDataCopy.accountHistory
    ? accountDataCopy.getFullTransactionHistory()
    : [];
}
