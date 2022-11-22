import { useAccountWithdrawableTokens } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';

export const usePortfolioButtonBar = () => {
  const { pathname: currentPath } = useLocation();
  const withdrawableTokens = useAccountWithdrawableTokens();
  const history = useHistory();

  const buttonData = [
    {
      buttonText: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}`);
      },
    },
  ];

  if (withdrawableTokens.length > 0) {
    buttonData.push({
      buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.WITHDRAW}`);
      },
    });
  }

  return {
    buttonData,
  };
};
