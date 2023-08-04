import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import {
  LiquidityLeveragedSummary,
  LiquidityLeveragedSidebar,
} from './components';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const LeveragedLiquidityContext = createTradeContext('LeveragedNToken');

export const LiquidityLeveraged = () => {
  const liquidityState = useTradeContext('LeveragedNToken');

  const {
    state: { isReady, confirm },
  } = liquidityState;

  return (
    <LeveragedLiquidityContext.Provider value={liquidityState}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LiquidityLeveragedSidebar />}
          mainContent={<LiquidityLeveragedSummary />}
        />
      </FeatureLoader>
    </LeveragedLiquidityContext.Provider>
  );
};

export default LiquidityLeveraged;
