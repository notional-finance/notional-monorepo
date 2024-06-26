import { Player } from '@lottiefiles/react-lottie-player';
import { styled, Box } from '@mui/material';
// import { HeroContent, HeroStats } from './components';
import { HeroContent } from './components';
import MobileLottie from './images/mobile-lottie.json';
import DesktopLottie from './images/desktop-lottie.json';
import { useState } from 'react';

export const Hero = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const width = window.innerWidth;
  if (width < 1000 && !isMobile) {
    setIsMobile(true);
  }

  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    if (width < 1000 && !isMobile) {
      setIsMobile(true);
    }
    if (width > 1000 && isMobile) {
      setIsMobile(false);
    }
  });

  return (
    <HeroContainer>
      <Player
        autoplay
        loop
        id="lottie-player"
        src={isMobile ? MobileLottie : DesktopLottie}
        style={{
          background:
            'linear-gradient(259.11deg, #004453 5.12%, #002129 99.67%)',
        }}
      />
      <Container>
        <HeroContent />
        {/* <HeroStats /> */}
      </Container>
    </HeroContainer>
  );
};

const HeroContainer = styled(Box)(
  ({ theme }) => `
   #lottie-player {
      min-width: 100vw;
      max-height: 100vh;
      height: 100%;
      padding-top: 1px;
    }

  ${theme.breakpoints.down('smLanding')} {
    #lottie-player {
      height: ${theme.spacing(180)};
      width: ${theme.spacing(125)};
      max-height: 100%;
    }
    height: 100%;
    min-height: ${theme.spacing(100)};
    min-width: 100vw;
    background-color: ${theme.palette.background.paper};
    overflow: hidden;
    ${theme.breakpoints.down('md')} {
      min-height: ${theme.spacing(180)};
    }
    ${theme.breakpoints.down('sm')} {
      min-height: ${theme.spacing(180)};
      #lottie-player {
        display: none;
      }
    }
  }
`
);

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  position: absolute;
  top: ${theme.spacing(9)};
  justify-content: space-between;
  left: 0;
  width: 100%;
  ${theme.breakpoints.down('smLanding')} {
    flex-direction: column;
  }
  `
);

export default Hero;
