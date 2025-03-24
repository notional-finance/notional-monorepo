import { styled, Box, useTheme } from '@mui/material';
import {
  LargeInputText,
  BodySecondary,
  ProgressIndicator,
} from '@notional-finance/mui';
import statsImg from '../images/stats_overlay.svg';
import { FormattedMessage } from 'react-intl';
import { formatNumber } from '@notional-finance/helpers';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { useFeatureValue } from '@growthbook/growthbook-react';

const oneMillion = 1_000_000;

const HeroStats = () => {
  const theme = useTheme();
  const {
    heroStats: { totalAccounts, totalDeposits, totalOpenDebt },
  } = useAppStore();
  const showAPYStats = useFeatureValue('show-apy-stats', null);
  const showHeroStats = totalAccounts && totalDeposits && totalOpenDebt;

  let statsContainer: React.ReactNode = <ProgressIndicator type="notional" />;
  if (showAPYStats === null) {
    // Wait for the feature flag to be evaluated
    statsContainer = <ProgressIndicator type="notional" />;
  } else if (showAPYStats) {
    statsContainer = (
      <Box sx={{ paddingTop: theme.spacing(24) }}>
        <LargeInputText>
          {`40.0%+`}
          <BodySecondary>
            <FormattedMessage defaultMessage={'Average Leveraged Pendle APY'} />
          </BodySecondary>
        </LargeInputText>
        <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
          {`8.3%+`}
          <BodySecondary>
            <FormattedMessage defaultMessage={'Average USDC Lend APY'} />
          </BodySecondary>
        </LargeInputText>
      </Box>
    );
  } else if (showHeroStats) {
    statsContainer = (
      <Box sx={{ paddingTop: theme.spacing(19.75) }}>
        <LargeInputText>
          {`$${formatNumber(totalDeposits / oneMillion, 2)}M`}
          <BodySecondary>
            <FormattedMessage defaultMessage={'Total Deposits'} />
          </BodySecondary>
        </LargeInputText>
        <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
          {`$${formatNumber(totalOpenDebt / oneMillion, 1)}M`}
          <BodySecondary>
            <FormattedMessage defaultMessage={'Total Open Debt'} />
          </BodySecondary>
        </LargeInputText>
        <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
          {totalAccounts}
          <BodySecondary>
            <FormattedMessage defaultMessage={'Active Accounts'} />
          </BodySecondary>
        </LargeInputText>
      </Box>
    );
  }

  return (
    <StatsContainer>
      <ImgContainer>
        <StatsContent>{statsContainer}</StatsContent>
      </ImgContainer>
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

const ImgContainer = styled(Box)(
  ({ theme }) => `
      border-image: linear-gradient(to top, ${
        theme.palette.primary.light
      }, rgba(0, 0, 0, 0)) 50 100%;
      padding-top: 0px;
      padding-bottom: 0px;
      height: 100%;
      border-width: 0 0 0 1px;
      border-style: solid;
      width: 100%;
      backdrop-filter: blur(2px);
      background: url(${statsImg}) no-repeat;
      background-size: ${theme.spacing(50)} 100%;

      ${theme.breakpoints.down('md')} {
        margin-top: 0px;
        padding-bottom: ${theme.spacing(6)};
      }
      ${theme.breakpoints.down('smLanding')} {
        background-size: 100% 100%;
      }
    `
);

const StatsContent = styled(Box)(
  ({ theme }) => `
      display: flex;
      flex-direction: column;
      
      ${theme.breakpoints.down('mdLanding')} {
        padding-top: ${theme.spacing(5)};
      }
      @media(max-height: 800px) {
        padding-top: ${theme.spacing(5)};
      }
      ${theme.breakpoints.down('md')} {
        margin: 0 ${theme.spacing(2)} 0 ${theme.spacing(2)}};
        align-items: center;
        justify-content: center;
      }
      `
);

export default observer(HeroStats);
