import { ToggleSwitchProps } from '@notional-finance/mui';
import { TransactionSidebar } from '@notional-finance/trade';
import { useParams } from 'react-router';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useCallback } from 'react';
import { TradeContext } from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { Box, useTheme } from '@mui/material';

interface PortfolioSideDrawerProps {
  children?: React.ReactNode | React.ReactNode[];
  advancedToggle?: ToggleSwitchProps;
  context: TradeContext;
  isWithdraw?: boolean;
  enablePrimeBorrow?: boolean;
  requiredApprovalAmount?: TokenBalance;
}

export const PortfolioSideDrawer = ({
  context,
  children,
  advancedToggle,
  isWithdraw,
  enablePrimeBorrow,
  requiredApprovalAmount,
}: PortfolioSideDrawerProps) => {
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();

  const returnToPortfolio = `/portfolio/${category}`;
  const { clearSideDrawer } = useSideDrawerManager();

  const onCancel = useCallback(() => {
    clearSideDrawer(returnToPortfolio);
  }, [clearSideDrawer, returnToPortfolio]);

  return (
    <TransactionSidebar
      context={context}
      isPortfolio
      onCancelCallback={onCancel}
      onReturnToForm={onCancel}
      advancedToggle={advancedToggle}
      isWithdraw={isWithdraw}
      variableBorrowRequired={enablePrimeBorrow}
      requiredApprovalAmount={requiredApprovalAmount}
    >
      <Box sx={{ marginBottom: theme.spacing(6) }}>{children}</Box>
    </TransactionSidebar>
  );
};
