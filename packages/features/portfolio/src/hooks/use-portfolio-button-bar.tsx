import {
  useAccountDefinition,
  useSelectedPortfolioNetwork,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { TableTitleButtonsType } from '@notional-finance/mui';

export const usePortfolioButtonBar = () => {
  const network = useSelectedPortfolioNetwork();
  const account = useAccountDefinition(network);
  const accountReady = !!account;
  const { pathname: currentPath } = useLocation();
  const hasWithdrawableTokens = account?.balances.find(
    (t) => t.isPositive() && !t.isVaultToken
  );
  const hasDebts = !!account?.balances.find(
    (t) => t.isNegative() && !t.isVaultToken
  );

  const history = useHistory();

  const buttonData: TableTitleButtonsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}/ETH`);
      },
    },
  ];

  if (hasWithdrawableTokens) {
    buttonData.push({
      buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
      callback: () => {
        history.push(
          `${currentPath}/${PORTFOLIO_ACTIONS.WITHDRAW}/${hasWithdrawableTokens?.token.id}`
        );
      },
    });
  }

  if (hasDebts) {
    buttonData.push({
      buttonText: <FormattedMessage defaultMessage={'Deleverage'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DELEVERAGE}`);
      },
    });
  }

  return accountReady ? buttonData : [];
};
