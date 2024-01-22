import { Box, ThemeProvider, styled } from '@mui/material';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  ContestCountDown,
  ContestPrizes,
  SectionTitle,
  OuterContainer,
  BgImgContainer,
  MainContainer,
  ContestButtonBar,
} from '../components';
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
      <OuterContainer>
        <BgImgContainer>
          <img src={test} alt="bg img" />
        </BgImgContainer>
        <OpacityBG>
          <MainContainer>
            <SectionTitle
              sx={{
                marginBottom: theme.spacing(4),
                display: 'flex',
              }}
            >
              <Box
                component="span"
                sx={{
                  marginTop: theme.spacing(10),
                }}
              >
                <FormattedMessage defaultMessage={'Leaderboard'} />
              </Box>
            </SectionTitle>
            <CountDownContainer>
              <ContestCountDown sx={{ marginBottom: '0px' }} />
              <Button
                size="large"
                variant="outlined"
                to="/contest-rules"
                sx={{
                  width: theme.spacing(41.25),
                  border: `1px solid ${colors.neonTurquoise}`,
                  ':hover': {
                    background: colors.matteGreen,
                  },
                  fontFamily: 'Avenir Next',
                }}
              >
                <FormattedMessage defaultMessage={'Rules & Prizes'} />
              </Button>
            </CountDownContainer>
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
                          {currentUserData[0].username?.dataSet === 'highRoller'
                            ? 'HIGH ROLLER'
                            : currentUserData[0].username?.dataSet === 'fatCat'
                            ? 'FAT CAT'
                            : 'SAD SACK'}
                        </Box>
                      ),
                    }}
                  />
                </SectionTitle>
                <ContestTable
                  maxHeight={theme.spacing(77.5)}
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
                maxHeight={theme.spacing(77.5)}
                tableTitle={<FormattedMessage defaultMessage={'HIGH ROLLER'} />}
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
                maxHeight={theme.spacing(77.5)}
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
            {/* TODO: Hide this if the user has minted a contest pass */}
            <Box sx={{ display: 'flex', marginTop: '100px' }}>
              <ContestButtonBar
                buttonOneText={
                  <FormattedMessage defaultMessage={'Rules & Prizes'} />
                }
                buttonOnePathTo="/contest-rules"
                buttonTwoText={
                  <FormattedMessage defaultMessage={'Contest Home'} />
                }
                buttonTwoPathTo="/contest"
              />
            </Box>
          </MainContainer>
        </OpacityBG>
      </OuterContainer>
    </ThemeProvider>
  );
};

const TableContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(11)};
  ${theme.breakpoints.down('md')} {
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing(11)};
  }
    `
);

const UserTableContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
  ${theme.breakpoints.down('md')} {
    justify-content: center;
    flex-direction: column;
  }
    `
);

const CountDownContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    display: flex;
    justify-content: center;
    flex-direction: column;
    a { margin-top: ${theme.spacing(4)}; }
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
