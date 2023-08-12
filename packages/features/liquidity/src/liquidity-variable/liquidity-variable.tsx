import { SideBarLayout } from '@notional-finance/mui';
import {
  LiquidityVariableSummary,
  LiquidityVariableSidebar,
} from './components';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';

export const LiquidityContext = createTradeContext('MintNToken');

export const LiquidityVariable = () => {
  const liquidityState = useTradeContext('MintNToken');

  const {
    state: { isReady, confirm },
  } = liquidityState;

  return (
    <LiquidityContext.Provider value={liquidityState}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LiquidityVariableSidebar />}
          mainContent={<LiquidityVariableSummary />}
        />
      </FeatureLoader>
    </LiquidityContext.Provider>
  );
};

export default LiquidityVariable;
