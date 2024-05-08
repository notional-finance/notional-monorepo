import { Box, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { AnimationItem } from 'lottie-web';
import { Player } from '@lottiefiles/react-lottie-player';
import { ProgressIndicator } from '@notional-finance/mui';
import betaPass from '../assets/betaPass.svg';
import betaPassOverlay from '../assets/beta-pass-overlay.json';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { BETA_ACCESS } from '@notional-finance/notionable';

// NOTE* Keeping this component incase we want to bring back the beta pass transition at some point
export const ContestNftPass = () => {
  const [imgLoaded, setImgLoaded] = useState(false);
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
    <Container>
      <OverlayContainer>
        <Player
          autoplay={false}
          onEvent={(event) => {
            if (
              event === 'complete' &&
              hasContestNFT === BETA_ACCESS.CONFIRMED
            ) {
              setHideImg(true);
            }
          }}
          lottieRef={(instance) => {
            if (instance) {
              setLottieInstance(instance);
            }
          }}
          src={betaPassOverlay}
          style={{
            display: hideImg ? 'none' : 'block',
          }}
        />
      </OverlayContainer>
      <img
        src={betaPass}
        alt="beta pass gif"
        onLoad={() => setImgLoaded(true)}
      />

      {!imgLoaded && <ProgressIndicator />}
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    min-width: 275px;
    min-height: 550px;
    ${theme.breakpoints.down('md')} {
      display: flex;
      justify-content: center;
    }
      `
);

const OverlayContainer = styled(Box)(
  ({ theme }) => `
  position: absolute;
  z-index: 4;
  width: 275px;
  height: 459px;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
    ${theme.breakpoints.down('md')} {
      height: 550px;
    }
      `
);

export default ContestNftPass;
