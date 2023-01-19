import { ActionSidebar, ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionData } from '@notional-finance/notionable';
import { AccountData } from '@notional-finance/sdk';
import { TransactionConfirmation } from '@notional-finance/trade';
import { RiskSlider, AccountRiskTable } from '@notional-finance/risk';
import { useQueryParams } from '@notional-finance/utils';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { useHistory, useLocation, useParams } from 'react-router';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { messages } from '../messages';
import { useEffect } from 'react';

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
  const { clearSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    if (search.includes('confirm=true')) {
      history.push(cancelRoute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return confirmRoute && transactionData ? (
    <TransactionConfirmation
      heading={transactionData?.transactionHeader}
      onCancel={() => history.push(cancelRoute)}
      transactionProperties={transactionData?.transactionProperties}
      buildTransactionCall={transactionData?.buildTransactionCall}
      showDrawer={false}
      onReturnToForm={() => history.push(cancelRoute)}
    />
  ) : (
    <ActionSidebar
      heading={messages[action].heading}
      helptext={messages[action].helptext}
      advancedToggle={advancedToggle}
      showDrawer={false}
      canSubmit={canSubmit}
      onCancelCallback={() => clearSideDrawer(returnToPortfolio)}
      hideTextOnMobile={false}
    >
      {children}
      <RiskSlider key={'risk-slider'} updatedAccountData={updatedAccountData} />
      <AccountRiskTable
        key={'risk-data-table'}
        updatedAccountData={updatedAccountData}
      />
    </ActionSidebar>
  );
};
