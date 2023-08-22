import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useHistory, useParams } from 'react-router';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useCallback } from 'react';
import { TradeContext } from '@notional-finance/notionable-hooks';
import { Box, useTheme } from '@mui/material';

interface PortfolioSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
  context: TradeContext;
}

export const PortfolioSideDrawer = ({
  context,
  children,
  advancedToggle,
}: PortfolioSideDrawerProps) => {
  const history = useHistory();
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();

  const returnToPortfolio = `/portfolio/${category}`;
  const { clearSideDrawer } = useSideDrawerManager();

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
      onCancelCallback={onCancel}
      onReturnToForm={onReturnToForm}
      advancedToggle={advancedToggle}
    >
      <Box sx={{ marginBottom: theme.spacing(6) }}>{children}</Box>
    </TransactionSidebar>
  );
};
