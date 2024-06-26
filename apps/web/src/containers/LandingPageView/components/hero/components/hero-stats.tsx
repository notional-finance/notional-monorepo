import { styled, Box } from '@mui/material';
// import {
//   LargeInputText,
//   BodySecondary,
//   Button,
//   ProgressIndicator,
// } from '@notional-finance/mui';
// import { ExternalLinkIcon } from '@notional-finance/icons';
// import statsImg from '../images/stats_overlay.svg';
// import { useStatsData } from './use-stats-data';
// import { FormattedMessage } from 'react-intl';
// import { formatNumber } from '@notional-finance/helpers';
// import { useNotionalContext } from '@notional-finance/notionable-hooks';
// import { SupportedNetworks } from '@notional-finance/util';

// const oneMillion = 1_000_000;

export const HeroStats = () => {
  // useStatsData().then((data) => console.log(data));
  // const theme = useTheme();
  // const {
  //   globalState: { heroStats, activeAccounts },
  // } = useNotionalContext();
  // const isReady = SupportedNetworks.every(
  //   (n) => activeAccounts && activeAccounts[n]
  // );

  return (
    <StatsContainer>
      {/* <ImgContainer>
        <StatsContent>
          {isReady && heroStats ? (
            <div>
              <LargeInputText>
                {`$${formatNumber(
                  heroStats.totalValueLocked / oneMillion,
                  2
                )}M`}
                <BodySecondary>
                  <FormattedMessage defaultMessage={'Total Value Locked'} />
                </BodySecondary>
              </LargeInputText>
              <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
                {`$${formatNumber(heroStats.totalOpenDebt / oneMillion, 1)}M`}
                <BodySecondary>
                  <FormattedMessage defaultMessage={'Total Open Debt'} />
                </BodySecondary>
              </LargeInputText>
              <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
                {heroStats?.totalAccounts}
                <BodySecondary>
                  <FormattedMessage defaultMessage={'Active Accounts'} />
                </BodySecondary>
              </LargeInputText>
              <Button
                size="large"
                variant="outlined"
                sx={{ marginTop: theme.spacing(6) }}
                href="https://dune.com/PierreYves_Gendron/notional-dashboard"
              >
                <FormattedMessage defaultMessage={'Analytics Dashboard'} />
                <ExternalLinkIcon
                  sx={{
                    marginLeft: theme.spacing(2),
                    height: '1rem',
                    marginTop: '-2px',
                  }}
                  fill={theme.palette.primary.main}
                />
              </Button>
            </div>
          ) : (
            <ProgressIndicator type="notional" />
          )}
        </StatsContent>
      </ImgContainer> */}
    </StatsContainer>
  );
};

const StatsContainer = styled(Box)(
  ({ theme }) => `
      height: 100vh;
      width: ${theme.spacing(50)};
      text-align: center;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      ${theme.breakpoints.down('smLanding')} {
        background-size: 100% ${theme.spacing(81)};
        min-height: 0px;
        height: ${theme.spacing(81)};
        width: ${theme.spacing(68)};
        margin: auto;
        position: relative;
        justify-content: center;
        border: 1px solid ${theme.palette.primary.light};
        border-radius: ${theme.shape.borderRadius()};
      }
      ${theme.breakpoints.down('sm')} {
        height: 100%;
        width: 90%;
      }
    `
);

// const ImgContainer = styled(Box)(
//   ({ theme }) => `
//       border-image: linear-gradient(to top, ${
//         theme.palette.primary.light
//       }, rgba(0, 0, 0, 0)) 50 100%;
//       padding-top: 0px;
//       padding-bottom: 0px;
//       height: 100%;
//       border-width: 0 0 0 1px;
//       border-style: solid;
//       width: 100%;
//       backdrop-filter: blur(2px);
//       background: url(${statsImg}) no-repeat;
//       background-size: ${theme.spacing(50)} 100%;

//       ${theme.breakpoints.down('md')} {
//         margin-top: 0px;
//         padding-bottom: ${theme.spacing(6)};
//       }
//       ${theme.breakpoints.down('smLanding')} {
//         background-size: 100% 100%;
//       }
//     `
// );

// const StatsContent = styled(Box)(
//   ({ theme }) => `
//       display: flex;
//       flex-direction: column;
//       padding-top: ${theme.spacing(19.75)};
//       ${theme.breakpoints.down('mdLanding')} {
//         padding-top: ${theme.spacing(5)};
//       }
//       @media(max-height: 800px) {
//         padding-top: ${theme.spacing(5)};
//       }
//       ${theme.breakpoints.down('md')} {
//         margin: 0 ${theme.spacing(2)} 0 ${theme.spacing(2)}};
//         align-items: center;
//         justify-content: center;
//       }
//       `
// );

export default HeroStats;
