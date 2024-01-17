import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import { FeatureLoader } from '@notional-finance/shared-web';
import { ContestCountDown, ContestPrizes, SectionTitle } from '../components';
import { ContestTable, LinkText, Button } from '@notional-finance/mui';
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
  } = useLeaderBoardTables();

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
            <img src={test} alt="bg img" />
          </BgImgContainer>
          <OpacityBG>
            <MainContainer>
              <SectionTitle
                sx={{
                  marginBottom: theme.spacing(4),
                  marginTop: theme.spacing(13),
                  display: 'flex',
                }}
              >
                <FormattedMessage defaultMessage={'Leaderboard'} />
              </SectionTitle>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ContestCountDown sx={{ marginBottom: '0px' }} />
                <Button
                  size="large"
                  variant="outlined"
                  to="/contest-rules"
                  sx={{
                    width: '358px',
                    border: `1px solid ${colors.neonTurquoise}`,
                    ':hover': {
                      background: colors.matteGreen,
                    },
                    fontFamily: 'Avenir Next',
                  }}
                >
                  <FormattedMessage defaultMessage={'Rules & Prizes'} />
                </Button>
              </Box>

              {currentUserData.length > 0 && (
                <UserTableContainer>
                  <SectionTitle
                    sx={{
                      marginBottom: theme.spacing(4),
                      marginTop: theme.spacing(13),
                      display: 'flex',
                    }}
                  >
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
                  </SectionTitle>
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
              <ContestPrizes />
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
  ({ theme }) => `
  padding-top: ${theme.spacing(15)};
  margin-top: ${theme.spacing(15)};
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

export default ContestLeaderBoard;
