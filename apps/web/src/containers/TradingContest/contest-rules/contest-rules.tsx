import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  ContestPrizes,
  OuterContainer,
  ContestRulesInfo,
  ContestBackButton,
  BgImgContainer,
  MainContainer,
} from '../components';
import { useNotionalTheme } from '@notional-finance/styles';
import test from '../assets/color-blobs.png';

export const ContestRules = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  return (
    <ThemeProvider theme={theme}>
      <OuterContainer>
        <BgImgContainer>
          <img src={test} alt="bg img" />
        </BgImgContainer>
        <OpacityBG>
          <MainContainer sx={{ maxWidth: '1100px' }}>
            <ContestBackButton />
            <ContestPrizes />
            <ContestRulesInfo />
          </MainContainer>
        </OpacityBG>
      </OuterContainer>
    </ThemeProvider>
  );
};

const OpacityBG = styled(Box)(
  `
  background: rgba(4, 29, 46, 0.85);
  position: relative;
  z-index: 3;
    `
);

export default ContestRules;
