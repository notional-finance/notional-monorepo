import { SideBarLayout } from '@notional-finance/mui';
import {
  useStakedNoteData,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import { Stake, CoolDown, Redeem } from './sidebars';
import StakeNOTESummary from './stake-note-summary';
import { observer } from 'mobx-react-lite';

export const StakeNOTE = observer(() => {
  const context = useTradeContext('StakeNOTE');
  const tradeType = context.tradeModel?.tradeType;
  const isReady = context.tradeModel?.isReady || false;
  const confirm = context.tradeModel?.confirm || false;
  const stakedNoteData = useStakedNoteData();

  return (
    <FeatureLoader
      featureLoaded={isReady === true && stakedNoteData !== undefined}
    >
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
  );
});

export default StakeNOTE;
