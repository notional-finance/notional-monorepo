import { ActionSidebar, ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionData } from '@notional-finance/notionable';
import { AccountData } from '@notional-finance/sdk';
import { TransactionConfirmation } from '@notional-finance/trade';
import { RiskSlider, AccountRiskTable } from '@notional-finance/risk';
import { PORTFOLIO_ACTIONS, useQueryParams } from '@notional-finance/utils';
import { useHistory, useLocation, useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { messages } from '../messages';

interface PortfolioSideDrawerProps {
  action: PORTFOLIO_ACTIONS;
  canSubmit: boolean;
  children?: React.ReactNode | React.ReactNode[];
  transactionData?: TransactionData;
  updatedAccountData?: AccountData;
  advancedToggle?: ToggleSwitchProps;
}

export const PortfolioSideDrawer = ({
  action,
  children,
  canSubmit,
  transactionData,
  updatedAccountData,
  advancedToggle,
}: PortfolioSideDrawerProps) => {
  const history = useHistory();
  const { search } = useLocation();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;

  // The cancel route should be the current route including all the
  // query strings except for confirm.
  const searchParams = new URLSearchParams(search);
  searchParams.delete('confirm');
  const cancelRoute = `/portfolio/${category}/${sideDrawerKey}${
    searchParams.toString() ? '?' + searchParams.toString() : ''
  }`;
  const returnToPortfolio = `/portfolio/${category}`;

  return confirmRoute && transactionData ? (
    <TransactionConfirmation
      heading={transactionData?.transactionHeader}
      onCancel={() => history.push(cancelRoute)}
      transactionProperties={transactionData?.transactionProperties}
      buildTransactionCall={transactionData?.buildTransactionCall}
      showDrawer={false}
      onReturnToForm={() => history.push(returnToPortfolio)}
    />
  ) : (
    <ActionSidebar
      heading={messages[action].heading}
      helptext={messages[action].helptext}
      advancedToggle={advancedToggle}
      showDrawer={false}
      canSubmit={canSubmit}
      cancelRoute={returnToPortfolio}
    >
      {children}
      <RiskSlider key={'risk-slider'} updatedAccountData={updatedAccountData} />
      <AccountRiskTable key={'risk-data-table'} updatedAccountData={updatedAccountData} />
    </ActionSidebar>
  );
};
