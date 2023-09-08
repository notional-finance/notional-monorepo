import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import { FeatureLoader } from '@notional-finance/shared-web';
import { FormattedMessage } from 'react-intl';
import {
  ContestHeader,
  ContestHero,
  ContestCountDown,
  ContestMultiTable,
  ContestNfts,
} from '../components';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import backgroundColors from '../assets/color-blobs.png';

export const ContestHome = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  return (
    <ThemeProvider theme={theme}>
      <FeatureLoader
        backgroundColor={'#041D2E'}
        sx={{
          marginTop: {
            xs: '-107px',
            sm: '-107px',
            md: '-107px',
            lg: '-125px',
            xl: '-125px',
          },
        }}
      >
        <OuterContainer>
          <BgImgContainer>
            <img src={backgroundColors} alt="bg img" />
          </BgImgContainer>
          <MainContainer>
            <ContestHeader />
            <ContestHero />
          </MainContainer>
          <OpacityBG>
            <MainContainer>
              <ContestCountDown
                title={<FormattedMessage defaultMessage={'v3 Beta Contest '} />}
              />
              <ContestMultiTable />
              <ContestNfts />
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
  ({ theme }) => `
  background: rgba(4, 29, 46, 0.7);
  border-top: 1px solid ${colors.greenGrey};
  position: relative;
  margin-top: ${theme.spacing(11)};
  z-index: 3;
    `
);

export default ContestHome;
