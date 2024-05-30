import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { SimpleOptionProps } from '@notional-finance/mui';
import { usePortfolioHoldings } from '@notional-finance/notionable-hooks';

export const useReduceRiskDropdown = () => {
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const { pathname: currentPath } = useLocation();

  const debtData = holdings?.filter(
    ({ maturedTokenId, balance }) => maturedTokenId && !balance.isPositive()
  );

  const history = useHistory();

  const options: SimpleOptionProps[] = [
    {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}/ETH`);
      },
    },
    {
      label: <FormattedMessage defaultMessage={'Deleverage'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DELEVERAGE}`);
      },
    },
    {
      label: <FormattedMessage defaultMessage={'Repay Debt'} />,
      callback: () => {
        history.push(
          `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${debtData[0].maturedTokenId}`
        );
      },
    },
  ];

  return {
    options: options,
    title: <FormattedMessage defaultMessage={'Reduce Risk'} />,
  };
};
