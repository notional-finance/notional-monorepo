import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import {
  TitleText,
  ContestBodyText,
  StepContainer,
} from '../contest-shared-elements';
import { ContestButtonBar } from '../contest-button-bar';

export const ConnectContestWallet = () => {
  const theme = useTheme();
  const { setWalletSideDrawer } = useSideDrawerManager();
  return (
    <StepContainer>
      <TitleText
        sx={{ marginBottom: theme.spacing(5), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Connect Wallet" />
        <ContestBodyText sx={{ marginTop: theme.spacing(5) }}>
          <FormattedMessage defaultMessage="Connect the wallet you want to compete with. If you have a community partner NFT, connect with that wallet to be eligible for special community partner prizes." />
        </ContestBodyText>
      </TitleText>
      <ContestButtonBar
        buttonOneText={<FormattedMessage defaultMessage={'Back'} />}
        buttonOnePathTo={`/contest`}
        buttonTwoText={<FormattedMessage defaultMessage={'Connect Wallet'} />}
        buttonTwoCallBack={() =>
          setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
        }
      />
    </StepContainer>
  );
};

export default ConnectContestWallet;
