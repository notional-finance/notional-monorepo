import { TabToggle, ActionSidebar } from '@notional-finance/mui';
import { StakeAction } from '../stake-action/stake-action';
import { UnstakeAction } from '../unstake-action/unstake-action';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { messages } from '../messages';

const STAKE_TAB = 0;
const UNSTAKE_TAB = 1;

interface StakeSidebarViewProps {
  stakeOrUnstake: string;
}

export const StakeSidebarView = ({ stakeOrUnstake }: StakeSidebarViewProps) => {
  const history = useHistory();
  const selectedTab = stakeOrUnstake === 'unstake' ? UNSTAKE_TAB : STAKE_TAB;

  return (
    <ActionSidebar
      heading={
        selectedTab === STAKE_TAB
          ? messages.stake.heading
          : messages.unstake.heading
      }
      helptext={
        selectedTab === STAKE_TAB
          ? messages.stake.helptext
          : messages.unstake.helptext
      }
      showActionButtons={false}
    >
      <TabToggle
        tabLabels={[
          <FormattedMessage {...messages.stake.tabLabel} />,
          <FormattedMessage {...messages.unstake.tabLabel} />,
        ]}
        tabPanels={[<StakeAction />, <UnstakeAction />]}
        selectedTabIndex={selectedTab}
        onChange={(_, v) => {
          // Update the URL according to tab switches
          if (v === STAKE_TAB) history.push('/stake/ETH');
          else if (v === UNSTAKE_TAB) history.push('/unstake');
        }}
      />
    </ActionSidebar>
  );
};
