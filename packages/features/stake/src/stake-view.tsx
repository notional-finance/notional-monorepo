import { FeatureLoader, SideBarLayout } from '@notional-finance/mui';
import { useQueryParams } from '@notional-finance/utils';
import { MainContent } from './main-content/main-content';
import { useLocation } from 'react-router-dom';
import { StakeSidebarView } from './sidebar/sidebar';
import { ConfirmStakeView } from './stake-action/confirm-stake';
import { ConfirmUnstakeView } from './unstake-action/confirm-unstake';

export const StakeView = () => {
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;

  // Drive the selected tab via the url
  const { pathname } = useLocation();
  const [, stakeOrUnstake] = pathname.split('/', 2);

  let sidebarContent: React.ReactElement;
  if (confirmRoute && stakeOrUnstake === 'stake') {
    sidebarContent = <ConfirmStakeView />;
  } else if (confirmRoute && stakeOrUnstake === 'unstake') {
    sidebarContent = <ConfirmUnstakeView />;
  } else {
    sidebarContent = <StakeSidebarView stakeOrUnstake={stakeOrUnstake} />;
  }

  return (
    <FeatureLoader>
      <SideBarLayout
        mainContent={<MainContent />}
        sideBar={sidebarContent}
        showTransactionConfirmation={confirmRoute}
      />
    </FeatureLoader>
  );
};

export default StakeView;
