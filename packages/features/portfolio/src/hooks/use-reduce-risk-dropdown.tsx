import {
  useAccountDefinition,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { SimpleOptionProps } from '@notional-finance/mui';

export const useReduceRiskDropdown = () => {
  const network = useSelectedNetwork();
  const account = useAccountDefinition(network);
  const { pathname: currentPath } = useLocation();
  const hasDebts = !!account?.balances.find(
    (t) => t.isNegative() && !t.isVaultToken
  );

  const history = useHistory();

  const options: SimpleOptionProps[] = [
    {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}/ETH`);
      },
    },
  ];

  if (hasDebts) {
    options.push({
      label: <FormattedMessage defaultMessage={'Deleverage'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DELEVERAGE}`);
      },
    });
  }

  return {
    options: options,
    title: <FormattedMessage defaultMessage={'Reduce Risk'} />,
  };
};
