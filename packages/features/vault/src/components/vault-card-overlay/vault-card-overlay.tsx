import { useEffect, useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { LargeInputTextEmphasized, Caption } from '@notional-finance/mui';
import { BETA_ACCESS } from '@notional-finance/notionable';
import { AnimationItem } from 'lottie-web';
import { FormattedMessage } from 'react-intl';
import {
  useAccountReady,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { DegenScoreIcon } from '@notional-finance/icons';
import { Player } from '@lottiefiles/react-lottie-player';
import { colors } from '@notional-finance/styles';
import vaultLock from './vault-lock.json';
import { messages } from './messages';

export const VaultCardOverlay = () => {
  const theme = useTheme();
  // NOTE: the name can be dynamic in the future
  const accessGroup = 'degenscore';
  const isAccountReady = useAccountReady();
  const [lottieInstance, setLottieInstance] = useState<
    AnimationItem | undefined
  >();
  const [hideImg, setHideImg] = useState(false);
  const {
    globalState: { hasContestNFT },
  } = useNotionalContext();

  useEffect(() => {
    if (lottieInstance !== undefined) {
      if (hasContestNFT === BETA_ACCESS.CONFIRMED) {
        lottieInstance.play();
      }
      if (hasContestNFT === BETA_ACCESS.REJECTED) {
        setHideImg(false);
        if (lottieInstance.isLoaded) {
          lottieInstance.stop();
        }
      }
    }
  }, [lottieInstance, hasContestNFT]);

  return (
    <OverlayContainer sx={{ display: hideImg ? 'none' : 'block' }}>
      <Box
        sx={{
          position: 'absolute',
          zIndex: 5,
          marginLeft: '240px',
          marginTop: '25px',
        }}
      >
        <DegenScoreIcon />
      </Box>

      <Player
        autoplay={false}
        onEvent={(event) => {
          if (event === 'complete' && hasContestNFT === BETA_ACCESS.CONFIRMED) {
            setHideImg(true);
          }
        }}
        lottieRef={(instance) => {
          if (instance) {
            setLottieInstance(instance);
          }
        }}
        src={vaultLock}
      />

      <Box
        sx={{
          position: 'absolute',
          marginTop: `-${theme.spacing(26)}`,
          width: '100%',
          display: hasContestNFT !== BETA_ACCESS.CONFIRMED ? 'block' : 'none',
        }}
      >
        {!isAccountReady && (
          <MessageContainer>
            <LargeInputTextEmphasized
              sx={{ color: colors.neonTurquoise, fontWeight: 500 }}
            >
              <FormattedMessage defaultMessage={'Connect Wallet to Unlock'} />
            </LargeInputTextEmphasized>
            <Caption
              sx={{
                color: colors.greenGrey,
                fontWeight: 400,
                padding: theme.spacing(1),
              }}
            >
              <FormattedMessage {...messages[accessGroup].accountNotReady} />
            </Caption>
          </MessageContainer>
        )}
        {isAccountReady && hasContestNFT !== BETA_ACCESS.CONFIRMED && (
          <MessageContainer>
            <LargeInputTextEmphasized
              sx={{ color: colors.neonTurquoise, fontWeight: 500 }}
            >
              <FormattedMessage defaultMessage={'Vault Locked'} />
            </LargeInputTextEmphasized>
            <Caption
              sx={{
                color: colors.greenGrey,
                fontWeight: 400,
                padding: theme.spacing(1),
              }}
            >
              <FormattedMessage {...messages[accessGroup].vaultLocked} />
            </Caption>
          </MessageContainer>
        )}
      </Box>
    </OverlayContainer>
  );
};

const MessageContainer = styled(Box)(
  ({ theme }) => `
    background: rgba(1, 46, 58, 0.70);
    padding: ${theme.spacing(3)};
    width: 80%;
    margin: auto;
    border-radius: ${theme.shape.borderRadius()};
    `
);

const OverlayContainer = styled(Box)(
  ({ theme }) => `
    position: absolute;
    z-index: 4;
    margin-top: ${theme.spacing(6)};
    width: ${theme.spacing(38)};
    height: ${theme.spacing(62)};
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    `
);

export default VaultCardOverlay;
