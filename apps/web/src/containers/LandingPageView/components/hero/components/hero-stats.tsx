import { styled, Box, useTheme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  LargeInputText,
  BodySecondary,
  Button,
  ProgressIndicator,
} from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import statsImg from '../images/stats_overlay.svg';
import { FormattedMessage } from 'react-intl';
import { formatNumber } from '@notional-finance/helpers';

const KPIUrl = process.env['NX_DATA_URL'] || 'https://data.notional.finance';

export const HeroStats = () => {
  const theme = useTheme();
  const [topStats, setTopStats] = useState<{
    totalValueLocked: string;
    totalLoanVolume: string;
    totalAccounts: string;
  } | null>();

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await fetch(`${KPIUrl}/all/kpis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { totalAccounts, totalLoanVolume, totalValueLocked } =
        await response.json();
      const oneMillion = 1_000_000;
      setTopStats({
        totalValueLocked: `$${formatNumber(totalValueLocked / oneMillion, 0)}M`,
        totalLoanVolume: `$${formatNumber(totalLoanVolume / oneMillion, 0)}M`,
        totalAccounts: formatNumber(totalAccounts, 0),
      });
    } catch (e) {
      console.warn(e);
      // If this query fails then the top stats bar won't show
      setTopStats(null);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  return (
    <StatsContainer>
      <ImgContainer>
        <StatsContent>
          {topStats ? (
            <div>
              <LargeInputText>
                {topStats?.totalValueLocked}
                <BodySecondary>
                  <FormattedMessage defaultMessage={'Total Value Locked'} />
                </BodySecondary>
              </LargeInputText>
              <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
                {topStats?.totalLoanVolume}
                <BodySecondary>
                  <FormattedMessage defaultMessage={'Total Loan Volume'} />
                </BodySecondary>
              </LargeInputText>
              <LargeInputText sx={{ marginTop: theme.spacing(6) }}>
                {topStats?.totalAccounts}
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
            <ProgressIndicator type="circular" />
          )}
        </StatsContent>
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
      padding-top: ${theme.spacing(19.75)};
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

export default HeroStats;
