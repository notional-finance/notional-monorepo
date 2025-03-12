import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PositionCard from '../components/position-card';
import { H4 } from '@notional-finance/mui';
import { usePortfolioOverviewTable } from '../hooks';

interface IProps {
  data: ReturnType<typeof usePortfolioOverviewTable>['vaultHoldingsData'];
}

const LeverageVaultsOverview = ({ data }: IProps) => {
  const theme = useTheme();

  return (
    <Container>
      <HeadingContainer>
        <H4 sx={{ color: theme.palette.typography.light }}>
          <FormattedMessage
            defaultMessage="Leverage Vaults"
            description="leverage vaults"
          />
        </H4>
      </HeadingContainer>

      <Box>
        {data.map((item, i) => (
          <PositionCard
            tokenId={item.tokenId}
            header={{
              tokenSymbol: item.asset.symbol,
              tokenName: item.asset.label,
              description: item.asset.caption,
            }}
            data={{
              'Health Factor': {
                value: item.healthFactor.value,
                textColor: theme.palette.warning.main,
              },
              ...(item.marketApy
                ? {
                    'Market APY': {
                      value: item.marketApy,
                    },
                  }
                : {}),
              'Present Value':
                typeof item.presentValue === 'string'
                  ? {
                      value: item.presentValue,
                    }
                  : {
                      value: item.presentValue.data[0]?.displayValue,
                      description: item.presentValue.data[1]?.displayValue,
                    },
              'Total Earnings':
                typeof item.totalEarnings === 'string'
                  ? {
                      value: item.totalEarnings,
                    }
                  : {
                      value: item.totalEarnings.data[0]?.displayValue,
                      description: item.totalEarnings.data[1]?.displayValue,
                      textColor: theme.palette.primary.main,
                    },
            }}
            key={i}
          />
        ))}
      </Box>
    </Container>
  );
};

const HeadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderTop: `1px solid ${theme.palette.borders.default}`,
  background: theme.palette.background.paper,
  paddingTop: theme.spacing(2),
}));

export default LeverageVaultsOverview;
