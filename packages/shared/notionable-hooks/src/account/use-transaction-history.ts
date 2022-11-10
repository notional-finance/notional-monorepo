import { useAccount } from '..';

export function useTransactionHistory() {
  const { accountDataCopy } = useAccount();
  return accountDataCopy.accountHistory ? accountDataCopy.getFullTransactionHistory() : [];
}
