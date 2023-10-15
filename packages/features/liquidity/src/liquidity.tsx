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
import {
  LiquidityVariableSidebar,
  LiquidityVariableSummary,
} from './liquidity-variable';

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
  return (
    <LiquidityView
      tradeType="CreateLeveragedNToken"
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
