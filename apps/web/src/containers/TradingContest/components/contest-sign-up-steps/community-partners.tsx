import { styled, Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
import { PARTNERS } from '@notional-finance/notionable';
import {
  TitleText,
  ContestBodyText,
  StepContainer,
} from '../contest-shared-elements/contest-shared-elements';
import { ContestButtonBar } from '../contest-button-bar/contest-button-bar';
import Llama from './assets/Llama.svg';
import Cryptotesters from './assets/Cryptotesters.svg';
import L2DAO from './assets/L2DAO.svg';
import { useNotionalContext } from '@notional-finance/notionable-hooks';

const imgData = {
  [PARTNERS.LLAMAS]: {
    icon: Llama,
  },
  [PARTNERS.CRYPTO_TESTERS]: {
    icon: Cryptotesters,
  },
  [PARTNERS.L2DAO]: {
    icon: L2DAO,
  },
};

const CommunityFound = () => {
  const theme = useTheme();
  const {
    globalState: { partnerData },
  } = useNotionalContext();

  return (
    <StepContainer>
      <Box sx={{ marginBottom: theme.spacing(8) }}>
        <TitleText
          sx={{
            marginBottom: theme.spacing(5),
            marginTop: theme.spacing(8),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={partnerData?.id && imgData[partnerData?.id]?.icon}
            alt="community icon"
            style={{
              height: theme.spacing(7),
              width: theme.spacing(7),
              marginRight: theme.spacing(3),
            }}
          />
          <FormattedMessage
            defaultMessage="{community} NFT Found"
            values={{
              community: partnerData?.name,
            }}
          />
        </TitleText>
        <ContestBodyText sx={{ marginTop: theme.spacing(5) }}>
          <FormattedMessage
            defaultMessage="You are set to compete for the special {community} prizes! Confirm to move on."
            values={{
              community: partnerData?.name,
            }}
          />
        </ContestBodyText>
      </Box>
      <ContestButtonBar
        buttonOneText={<FormattedMessage defaultMessage={'Cancel'} />}
        buttonOnePathTo="/contest"
        buttonTwoText={<FormattedMessage defaultMessage={'Confirm'} />}
        buttonTwoPathTo="mint-pass"
      />
    </StepContainer>
  );
};

const ImageCluster = () => {
  const theme = useTheme();
  return (
    <ImageClusterContainer>
      <img
        src={L2DAO}
        alt="L2DAO icon"
        style={{
          height: theme.spacing(6),
          width: theme.spacing(6),
          position: 'absolute',
          marginTop: '-10px',
          marginLeft: '-65px',
        }}
      />
      <img
        src={Llama}
        alt="Llama icon"
        style={{
          height: theme.spacing(6),
          width: theme.spacing(6),
          marginTop: '-30px',
          position: 'absolute',
          marginLeft: '-25px',
        }}
      />
      <img
        src={Cryptotesters}
        alt="Cryptotesters icon"
        style={{
          height: theme.spacing(6),
          width: theme.spacing(6),
          position: 'absolute',
          marginTop: '7px',
        }}
      />
    </ImageClusterContainer>
  );
};

const CommunityNotFound = () => {
  const theme = useTheme();
  const { setWalletSideDrawer } = useSideDrawerManager();
  return (
    <StepContainer>
      <TitleText
        sx={{ marginBottom: theme.spacing(5), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Did You Know?" />
        <ImageCluster />
        <ContestBodyText sx={{ marginTop: theme.spacing(5) }}>
          <FormattedMessage defaultMessage="We offer special prizes for Llama, Cryptotester, and L2 DAO NFT holders. If you hold one of these NFTs, connect with that wallet to be eligible for those prizes. Otherwise, proceed to compete in the general contest." />
        </ContestBodyText>
      </TitleText>
      <ContestButtonBar
        buttonOneText={
          <FormattedMessage defaultMessage={'Connect Another Wallet'} />
        }
        buttonOneCallBack={() =>
          setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
        }
        buttonTwoText={
          <FormattedMessage defaultMessage={'Proceed To Contest'} />
        }
        buttonTwoPathTo="mint-pass"
      />
    </StepContainer>
  );
};

export const CommunityPartners = () => {
  const {
    globalState: { hasContestNFT },
  } = useNotionalContext();

  return hasContestNFT === 'confirmed' ? (
    <CommunityFound />
  ) : (
    <CommunityNotFound />
  );
};

export const ImageClusterContainer = styled(Box)(
  ({ theme }) => `
    position: absolute;
    right: 0;
    margin-right: ${theme.spacing(22)};
    margin-top: -55px;
    ${theme.breakpoints.down('md')} {
      margin-right: ${theme.spacing(13)};
    }
    ${theme.breakpoints.down('sm')} {
      position: relative;
      margin-top: 72px;
      height: 50px;
      margin-bottom: 50px;
      margin-right: 0px;
    }
    `
);

export default CommunityPartners;
