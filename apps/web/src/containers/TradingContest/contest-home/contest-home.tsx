import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  ContestHero,
  ContestPrizes,
  ContestPartners,
  OuterContainer,
  BgImgContainer,
  MainContainer,
} from '../components';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import backgroundColors from '../assets/color-blobs.png';

export const ContestHome = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  return (
    <ThemeProvider theme={theme}>
      <OuterContainer sx={{ paddingBottom: '0px' }}>
        <BgImgContainer>
          <img src={backgroundColors} alt="bg img" />
        </BgImgContainer>
        <MainContainer>
          <ContestHero />
        </MainContainer>
        <OpacityBG>
          <MainContainer>
            <ContestPrizes />
            <ContestPartners />
          </MainContainer>
        </OpacityBG>
      </OuterContainer>
    </ThemeProvider>
  );
};

export const OpacityBG = styled(Box)(
  ({ theme }) => `
  background: rgba(4, 29, 46, 0.7);
  border-top: 1px solid ${colors.greenGrey};
  position: relative;
  margin-top: ${theme.spacing(15)};
  z-index: 3;
    `
);

export default ContestHome;
