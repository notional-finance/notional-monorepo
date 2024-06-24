import { Box, ThemeProvider, styled } from '@mui/material';
import {
  THEME_VARIANTS,
  formatNumber,
  getDateString,
} from '@notional-finance/util';
import {
  SectionTitle,
  OuterContainer,
  BgImgContainer,
  MainContainer,
} from '../components';
import { useCurrentSeason } from './points-dashboard-constants';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import backgroundColors from '../assets/color-blobs.png';
import { YourPointsOverview } from './your-points-overview';
import { PointsDashboardManager } from './points-dashboard-manager';
import { FormattedMessage } from 'react-intl';
import { useAccountTotalPointsPerDay } from '@notional-finance/notionable-hooks';

export const PointsDashboard = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');

  const totalPointsPerDay = useAccountTotalPointsPerDay();
  const { startDate, endDate, name } = useCurrentSeason();
  return (
    <ThemeProvider theme={theme}>
      <OuterContainer sx={{ paddingBottom: '0px' }}>
        <BgImgContainer>
          <img src={backgroundColors} alt="bg img" />
        </BgImgContainer>
        <OpacityBG>
          <MainContainer>
            <TopContentContainer>
              <DisplayBoxWrapper>
                <SectionTitle sx={{ marginBottom: theme.spacing(3) }}>
                  {name}
                </SectionTitle>
                <DisplayBox>{`${getDateString(startDate.getTime() / 1000, {
                  hideYear: true,
                })} - ${getDateString(endDate.getTime() / 1000, {
                  hideYear: true,
                })}`}</DisplayBox>
              </DisplayBoxWrapper>
              <DisplayBoxWrapper>
                <SectionTitle sx={{ marginBottom: theme.spacing(3) }}>
                  <FormattedMessage defaultMessage={'Points per Day'} />
                </SectionTitle>
                <DisplayBox>{formatNumber(totalPointsPerDay, 2)}</DisplayBox>
              </DisplayBoxWrapper>
            </TopContentContainer>
          </MainContainer>
          <MainContainer
            sx={{
              paddingTop: theme.spacing(13),
              paddingBottom: theme.spacing(45),
            }}
          >
            <YourPointsOverview />
            <PointsDashboardManager />
          </MainContainer>
        </OpacityBG>
      </OuterContainer>
    </ThemeProvider>
  );
};

const TopContentContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
      padding-top: ${theme.spacing(13)};
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

const DisplayBoxWrapper = styled(Box)(
  ({ theme }) => `
    display: flex;    
    flex-direction: column;
    ${theme.breakpoints.down('sm')} {
      align-items: center;
      margin-bottom: ${theme.spacing(6)};
    }
      `
);

const DisplayBox = styled(Box)(
  ({ theme }) => `
    color: ${colors.white};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${theme.spacing(3)};
    font-style: normal;
    font-weight: 500;
    border: 1px solid ${colors.neonTurquoise};
    padding: 0px ${theme.spacing(3)};
    background: rgba(51, 248, 255, 0.10);
    width: ${theme.spacing(33)};
    height: ${theme.spacing(7)};
    ${theme.breakpoints.down('sm')} {
      width: 100%;
    }
      `
);

export default PointsDashboard;
