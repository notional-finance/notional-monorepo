import { Box } from '@mui/material';
import { PageLoading, Button } from '@notional-finance/mui';
import { SIDEBAR_CATEGORIES } from '@notional-finance/shared-config';
import { UnstakeStart } from './unstake-start';
import { UnstakeRedeem } from './unstake-redeem';
import { UnstakeCoolDown } from './unstake-cooldown';
import { useUnstakeAction } from './use-unstake-action';
import { useAccount, useOnboard } from '@notional-finance/notionable-hooks';
import { useWalletSideDrawer } from '@notional-finance/wallet';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';

export const UnstakeAction = () => {
  const { account } = useAccount();
  const { connected } = useOnboard();
  const { maxSNoteAmount, isInCoolDown, isInRedeemWindow } = useUnstakeAction();
  const { setWalletSideDrawer } = useWalletSideDrawer();

  let unstakeStage: React.ReactElement;
  if (maxSNoteAmount?.isZero()) {
    unstakeStage = <FormattedMessage {...messages.unstake.noSNOTEBalance} />;
  } else if (
    maxSNoteAmount?.isPositive() &&
    !isInCoolDown &&
    !isInRedeemWindow
  ) {
    unstakeStage = <UnstakeStart />;
  } else if (isInCoolDown && !isInRedeemWindow) {
    unstakeStage = <UnstakeCoolDown />;
  } else {
    unstakeStage = <UnstakeRedeem />;
  }

  return (
    <Box sx={{ minHeight: '505px' }}>
      {connected && !account && <PageLoading />}
      {connected && account && unstakeStage}
      {!account && (
        <Button
          variant="outlined"
          sx={{ width: '100%', marginTop: '48px' }}
          onClick={() => setWalletSideDrawer(SIDEBAR_CATEGORIES.CONNECT_WALLET)}
        >
          <FormattedMessage {...messages.unstake.connectWalletCTA} />
        </Button>
      )}
    </Box>
  );
};
