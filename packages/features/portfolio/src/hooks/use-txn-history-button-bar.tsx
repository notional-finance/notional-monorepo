import { FormattedMessage } from 'react-intl';
import { ButtonOptionsType } from '@notional-finance/mui';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';

export const useTxnHistoryButtonBar = (setTxnHistoryType, txnHistoryType) => {
  const buttonData: ButtonOptionsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Portfolio Holdings'} />,
      callback: () => setTxnHistoryType(TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS),
      active: txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
    },
    {
      buttonText: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      callback: () => setTxnHistoryType(TXN_HISTORY_TYPE.LEVERAGED_VAULT),
      active: txnHistoryType === TXN_HISTORY_TYPE.LEVERAGED_VAULT,
    },
  ];

  return buttonData;
};

export default useTxnHistoryButtonBar;
