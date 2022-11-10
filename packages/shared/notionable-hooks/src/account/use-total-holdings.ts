import { useNotional } from '../notional/use-notional';
import { useAccount } from './use-account';

export function useTotalHoldings() {
  const { system } = useNotional();
  const { accountDataCopy: accountData } = useAccount();
  return system ? accountData.getTotalCurrencyValue() : undefined;
}
