import { SideBarLayout } from '@notional-finance/mui';
import {
  createNOTEContext,
  useNOTEContext,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import { Stake, CoolDown, Redeem } from './drawers';
import { StakeNOTESummary } from './stake-note-summary';

export const NOTEContext = createNOTEContext();

export const StakeNOTE = () => {
  const context = useNOTEContext();
  const {
    state: { isReady, confirm, tradeType },
  } = context;
  return (
    <NOTEContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={
            tradeType === 'StakeNOTECoolDown' ? (
              <CoolDown />
            ) : tradeType === 'StakeNOTERedeem' ? (
              <Redeem />
            ) : (
              <Stake />
            )
          }
          mainContent={<StakeNOTESummary />}
        />
      </FeatureLoader>
    </NOTEContext.Provider>
  );
};

export default StakeNOTE;
