import { AccountData, FreeCollateral } from '@notional-finance/sdk';
import { useCurrency } from '../currency/use-currency';
import { useAccount } from './use-account';

export function useBorrowCapacity(_accountDataCopy?: AccountData) {
  const { accountDataCopy: a } = useAccount();
  const accountDataCopy = _accountDataCopy?.copy() || a;
  const { tradableCurrencyList } = useCurrency();
  return tradableCurrencyList.map((c) => {
    return FreeCollateral.getBorrowCapacity(c.id, accountDataCopy);
  });
}
