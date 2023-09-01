import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  ContestHeader,
  ContestCountDown,
  ContestBackButton,
} from '../components';
import { ContestTable, LinkText } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import test from '../assets/color-blobs.png';
import { useLeaderBoardTables } from '../hooks';

export const ContestLeaderBoard = () => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const {
    leaderBoardColumns,
    currentUserData,
    currentUserColumns,
    highRollerData,
    fatCatData,
    sadSackData,
  } = useLeaderBoardTables();

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
              <ContestCountDown
                title={<FormattedMessage defaultMessage={'Leaderboard'} />}
              />
              {currentUserData.length > 0 && (
                <UserTableContainer>
                  <TitleText>
                    <FormattedMessage
                      defaultMessage={'Your {position} Position'}
                      values={{
                        position: (
                          <Box
                            sx={{
                              color: colors.neonTurquoise,
                              margin: theme.spacing(0, 1),
                            }}
                          >
                            {currentUserData[0].username?.dataSet ===
                            'highRoller'
                              ? 'HIGH ROLLER'
                              : currentUserData[0].username?.dataSet ===
                                'fatCat'
                              ? 'FAT CAT'
                              : 'SAD SACK'}
                          </Box>
                        ),
                      }}
                    />
                  </TitleText>
                  <ContestTable
                    maxHeight={'620px'}
                    columns={currentUserColumns}
                    data={currentUserData}
                    isCurrentUser
                  />
                  <LinkText
                    to="/portfolio/overview"
                    sx={{ marginTop: theme.spacing(2) }}
                  >
                    <FormattedMessage defaultMessage={'View in Portfolio'} />
                  </LinkText>
                </UserTableContainer>
              )}
              <TableContainer>
                <ContestTable
                  maxHeight={'620px'}
                  tableTitle={
                    <FormattedMessage defaultMessage={'HIGH ROLLER'} />
                  }
                  tableTitleSubText={
                    <FormattedMessage
                      defaultMessage={'Highest realized APY with leverage'}
                    />
                  }
                  columns={leaderBoardColumns}
                  data={highRollerData}
                  tableLoading={highRollerData.length === 0}
                />
              </TableContainer>
              <TableContainer>
                <ContestTable
                  maxHeight={'620px'}
                  tableTitle={<FormattedMessage defaultMessage={'FAT CAT'} />}
                  tableTitleSubText={
                    <FormattedMessage
                      defaultMessage={'Highest realized APY without leverage'}
                    />
                  }
                  columns={leaderBoardColumns}
                  data={fatCatData}
                  tableLoading={fatCatData.length === 0}
                />
              </TableContainer>
              <TableContainer
                sx={{
                  marginBottom: `${theme.spacing(11)} !important`,
                }}
              >
                <ContestTable
                  maxHeight={'620px'}
                  tableTitle={<FormattedMessage defaultMessage={'SAD SACK'} />}
                  tableTitleSubText={
                    <FormattedMessage defaultMessage={'Lowest realized APY'} />
                  }
                  columns={leaderBoardColumns}
                  data={sadSackData}
                  tableLoading={sadSackData.length === 0}
                />
              </TableContainer>
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

const TableContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(11)};
  ${theme.breakpoints.down('md')} {
    display: flex;
    justify-content: center;
    max-width: 90%;
    margin: auto;
    margin-top: ${theme.spacing(11)};
  }
    `
);

const UserTableContainer = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('md')} {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    max-width: 90%;
    margin: auto;
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

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  text-align: left;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 10px;
  text-transform: uppercase;
  margin-bottom: ${theme.spacing(4)};
  margin-top: ${theme.spacing(13)};
  display: flex;
  ${theme.breakpoints.down('md')} {
    text-align: center;
    text-wrap: nowrap;
    letter-spacing: 5px;
    justify-content: center;
  }

      `
);

export default ContestLeaderBoard;
