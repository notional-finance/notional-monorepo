import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
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
      <Box sx={{ marginTop: '-162px', background: '#041D2E', height: '100%' }}>
        <FeatureLoader backgroundColor={'#041D2E'}>
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
  ({ theme }) => `
  background: rgba(4, 29, 46, 0.7);
  border-top: 1px solid ${colors.greenGrey};
  position: relative;
  margin-top: ${theme.spacing(5)};
  z-index: 3;
    `
);

export default ContestHome;
