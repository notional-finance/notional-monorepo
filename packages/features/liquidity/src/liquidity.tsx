import { SideBarLayout } from '@notional-finance/mui';
import { TradeType } from '@notional-finance/notionable';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import React from 'react';
import {
  LiquidityLeveragedSideDrawer,
  LiquidityLeveragedSummary,
} from './liquidity-leveraged';
import { LiquidityVariableSidebar } from './liquidity-variable';
import LiquidityVariableSummary from './liquidity-variable/liquidity-variable-summary';
import { useLocation } from 'react-router';

export const LiquidityContext = createTradeContext('Liquidity');

const LiquidityView = ({
  tradeType,
  sidebar,
  mainContent,
}: {
  tradeType: TradeType;
  sidebar: React.ReactElement;
  mainContent: React.ReactElement;
}) => {
  const context = useTradeContext(tradeType);

  const {
    state: { isReady, confirm },
  } = context;

  return (
    <LiquidityContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={sidebar}
          mainContent={mainContent}
        />
      </FeatureLoader>
    </LiquidityContext.Provider>
  );
};

export const LiquidityLeveraged = () => {
  // This resolves a race condition when linking directly from the portfolio page
  const { pathname } = useLocation();
  return (
    <LiquidityView
      tradeType={pathname.includes('Manage') ? 'RollDebt' : 'LeveragedNToken'}
      sidebar={<LiquidityLeveragedSideDrawer />}
      mainContent={<LiquidityLeveragedSummary />}
    />
  );
};

export const LiquidityVariable = () => {
  return (
    <LiquidityView
      tradeType="MintNToken"
      sidebar={<LiquidityVariableSidebar />}
      mainContent={<LiquidityVariableSummary />}
    />
  );
};
