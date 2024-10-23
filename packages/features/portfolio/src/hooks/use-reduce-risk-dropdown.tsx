import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { SimpleOptionProps } from '@notional-finance/mui';
import { usePortfolioHoldings } from '@notional-finance/notionable-hooks';

export const useReduceRiskDropdown = () => {
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const { pathname: currentPath } = useLocation();

  const debtData = holdings?.filter(
    ({ maturedTokenId, balance }) => maturedTokenId && !balance.isPositive()
  );

  const navigate = useNavigate();

  const options: SimpleOptionProps[] = [
    {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        navigate(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}/ETH`);
      },
    },
    {
      label: <FormattedMessage defaultMessage={'Deleverage'} />,
      callback: () => {
        navigate(`${currentPath}/${PORTFOLIO_ACTIONS.DELEVERAGE}`);
      },
    },
  ];

  if (debtData?.length) {
    options.push({
      label: <FormattedMessage defaultMessage={'Repay Debt'} />,
      callback: () => {
        navigate(
          `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${debtData[0].maturedTokenId}`
        );
      },
    });
  }

  return {
    options: options,
    title: <FormattedMessage defaultMessage={'Reduce Risk'} />,
  };
};
