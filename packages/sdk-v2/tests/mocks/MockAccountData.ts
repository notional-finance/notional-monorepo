import { AccountData } from '../../src/account';
import { Balance, AccountHistory } from '../../src/libs/types';
import { Asset } from '../../src/data';

export default class MockAccountData extends AccountData {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    nextSettleTime: number,
    hasCashDebt: boolean,
    hasAssetDebt: boolean,
    bitmapCurrencyId: number | undefined,
    accountBalances: Balance[],
    _portfolio: Asset[],
    isCopy: boolean,
    accountHistory?: AccountHistory
  ) {
    super(
      nextSettleTime,
      hasCashDebt,
      hasAssetDebt,
      bitmapCurrencyId,
      accountBalances,
      _portfolio,
      [],
      isCopy,
      accountHistory
    );
  }
}
