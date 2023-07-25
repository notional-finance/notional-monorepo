import { ActionSidebar, ToggleSwitchProps } from '@notional-finance/mui';
import { Confirmation2, TransactionData } from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { useHistory, useLocation, useParams } from 'react-router';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { messages } from '../messages';
import { useCallback, useContext } from 'react';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

interface PortfolioSideDrawerProps {
  action: PORTFOLIO_ACTIONS;
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
  context: BaseContext;
  // TODO: remove later
  canSubmit?: boolean;
  transactionData?: TransactionData;
  updatedAccountData?: any;
}

export const PortfolioSideDrawer = ({
  context,
  action,
  children,
  advancedToggle,
}: PortfolioSideDrawerProps) => {
  const {
    state: { canSubmit, confirm, populatedTransaction },
    updateState,
  } = useContext(context);
  const history = useHistory();
  const { search } = useLocation();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();

  // The cancel route should be the current route including all the
  // query strings except for confirm.
  const searchParams = new URLSearchParams(search);
  searchParams.delete('confirm');
  const cancelRoute = `/portfolio/${category}/${sideDrawerKey}${
    searchParams.toString() ? '?' + searchParams.toString() : ''
  }`;
  const returnToPortfolio = `/portfolio/${category}`;
  const { clearSideDrawer } = useSideDrawerManager();

  const onSubmit = useCallback(() => {
    updateState({ confirm: true });
  }, [updateState]);

  const onCancel = useCallback(() => {
    history.push(cancelRoute);
    updateState({ confirm: false });
  }, [history, updateState, cancelRoute]);

  return confirm && populatedTransaction ? (
    <Confirmation2
      context={context}
      heading={<FormattedMessage {...messages[action].heading} />}
      onCancel={onCancel}
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
      onCancelCallback={() => clearSideDrawer(returnToPortfolio)}
      hideTextOnMobile={false}
      handleSubmit={onSubmit}
    >
      {children}
    </ActionSidebar>
  );
};
