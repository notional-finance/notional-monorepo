import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  ContestHeader,
  ContestNfts,
  ContestRulesInfo,
  ContestBackButton,
} from '../components';
import { useNotionalTheme } from '@notional-finance/styles';
import test from '../assets/color-blobs.png';

export const ContestRules = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ marginTop: '-162px', background: '#041D2E', height: '100%' }}>
        <FeatureLoader backgroundColor={'#041D2E'}>
          <BgImgContainer>
            <img src={test} alt="bg img" />
          </BgImgContainer>
          <OpacityBG>
            <MainContainer>
              <ContestHeader />
              <ContestBackButton />
              <ContestNfts hideButton />
              <ContestRulesInfo />
            </MainContainer>
          </OpacityBG>
        </FeatureLoader>
      </Box>
    </ThemeProvider>
  );
};

const BgImgContainer = styled(Box)(
  `
  overflow: hidden;
  position: absolute;
  width: 100vw;
  z-index: 1;
  img {
    width: 100%;
  }
    `
);

const MainContainer = styled(Box)(
  `
  background: transparent;
  height: 100%;
  overflow: hidden;
  max-width: 1230px;
  margin: auto;
  position: relative;
  z-index: 3;
  margin-top: -10px;
    `
);

const OpacityBG = styled(Box)(
  `
  background: rgba(4, 29, 46, 0.85);
  position: relative;
  z-index: 3;
    `
);

export default ContestRules;
