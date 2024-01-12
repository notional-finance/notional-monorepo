import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  // ContestNfts,
  ContestRulesInfo,
  ContestBackButton,
} from '../components';
import { useNotionalTheme } from '@notional-finance/styles';
import test from '../assets/color-blobs.png';

export const ContestRules = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  return (
    <ThemeProvider theme={theme}>
      <FeatureLoader backgroundColor={'#041D2E'}>
        <OuterContainer>
          <BgImgContainer>
            <img src={test} alt="bg img" />
          </BgImgContainer>
          <OpacityBG>
            <MainContainer>
              <ContestBackButton />
              {/* <ContestNfts hideButton /> */}
              <ContestRulesInfo />
            </MainContainer>
          </OpacityBG>
        </OuterContainer>
      </FeatureLoader>
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
    `
);

const OuterContainer = styled(Box)(
  ({ theme }) => `
  margin-top: -123px;
  background: #041D2E; 
  height: 100%;
  ${theme.breakpoints.down('md')} {
    margin-top: -107px; 
  }
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
