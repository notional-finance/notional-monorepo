import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { ButtonOptionsType } from '@notional-finance/mui';
import { TXN_HISTORY_TYPE } from '@notional-finance/util';
import {
  useSelectedPortfolioNetwork,
  useTransactionHistory,
} from '@notional-finance/notionable-hooks';

export const useTxnHistoryButtonBar = (
  setTxnHistoryType: (type: TXN_HISTORY_TYPE) => void,
  txnHistoryType: TXN_HISTORY_TYPE
) => {
  const { search, pathname } = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(search);
  const network = useSelectedPortfolioNetwork();
  const hasVaultHoldings = !!useTransactionHistory(network).find(
    (h) => !!h.vaultName
  );

  const handleButtonBarClick = (type: TXN_HISTORY_TYPE) => {
    if (queryParams && queryParams.get('txnHistoryType')) {
      queryParams.delete('txnHistoryType');
      queryParams.delete('vaultAddress');
      history.push(pathname);
    }
    setTxnHistoryType(type);
  };

  const buttonData: ButtonOptionsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Portfolio Holdings'} />,
      callback: () => handleButtonBarClick(TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS),
      active: txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
    },
    {
      buttonText: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      callback: () => handleButtonBarClick(TXN_HISTORY_TYPE.LEVERAGED_VAULT),
      active: txnHistoryType === TXN_HISTORY_TYPE.LEVERAGED_VAULT,
    },
  ];

  return hasVaultHoldings ? buttonData : [];
};

export default useTxnHistoryButtonBar;
