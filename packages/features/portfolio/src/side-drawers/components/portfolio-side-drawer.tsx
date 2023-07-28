import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useHistory, useLocation, useParams } from 'react-router';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useCallback, useContext } from 'react';
import { BaseContext } from '@notional-finance/notionable-hooks';

interface PortfolioSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
  context: BaseContext;
}

export const PortfolioSideDrawer = ({
  context,
  children,
  advancedToggle,
}: PortfolioSideDrawerProps) => {
  const { updateState } = useContext(context);
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

  const onConfirmCancel = useCallback(() => {
    history.push(cancelRoute);
    updateState({ confirm: false });
  }, [history, updateState, cancelRoute]);

  const onReturnToForm = useCallback(() => {
    history.push(returnToPortfolio);
  }, [history, returnToPortfolio]);

  const onCancel = useCallback(() => {
    clearSideDrawer(returnToPortfolio);
  }, [clearSideDrawer, returnToPortfolio]);

  return (
    <TransactionSidebar
      context={context}
      isPortfolio
      onConfirmCancel={onConfirmCancel}
      onCancelCallback={onCancel}
      onReturnToForm={onReturnToForm}
      advancedToggle={advancedToggle}
    >
      {children}
    </TransactionSidebar>
  );
};
