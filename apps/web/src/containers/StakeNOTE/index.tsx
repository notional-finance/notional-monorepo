import { SideBarLayout } from '@notional-finance/mui';
import {
  createNOTEContext,
  useNOTEContext,
  useStakedNoteData,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import { Stake, CoolDown, Redeem } from './sidebars';
import { StakeNOTESummary } from './stake-note-summary';

export const NOTEContext = createNOTEContext();

export const StakeNOTE = () => {
  const context = useNOTEContext();
  const {
    state: { isReady, confirm, tradeType },
  } = context;
  const stakedNoteData = useStakedNoteData();

  return (
    <NOTEContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady && stakedNoteData !== undefined}>
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
          mainContent={<StakeNOTESummary stakedNoteData={stakedNoteData} />}
        />
      </FeatureLoader>
    </NOTEContext.Provider>
  );
};

export default StakeNOTE;
