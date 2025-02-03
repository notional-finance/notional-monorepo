import { Box, styled, Typography, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PositionCard from '../components/position-card';
import { useVaultHoldingsTable } from '@notional-finance/portfolio-feature-shell/hooks';

interface IProps {
  data: ReturnType<typeof useVaultHoldingsTable>['vaultHoldingsData'];
}

const LeverageVaultsOverview = ({ data }: IProps) => {
  const theme = useTheme();

  console.log(data);
  return (
    <Container>
      <Heading variant="h2">
        <FormattedMessage
          defaultMessage="Leverage Vaults"
          description="leverage vaults"
        />
      </Heading>

      <Box>
        {data.map((item, i) => (
          <PositionCard
            header={{
              tokenSymbol: item.vault.symbol,
              tokenName: item.vault.label,
              description: item.vault.caption,
            }}
            data={{
              ['Health Factor']: {
                value: item.healthFactor.value,
                textColor: item.healthFactor.textColor,
              },
              ...(item.marketAPY
                ? {
                    ['Market APY']: {
                      value: item.marketAPY,
                    },
                  }
                : {}),
              ['Present Value']:
                typeof item.presentValue === 'string'
                  ? {
                      value: item.presentValue,
                    }
                  : {
                      value: item.presentValue[0]?.isNegative
                        ? `-${item.presentValue[0]?.displayValue}`
                        : item.presentValue[0]?.displayValue,
                      description: item.presentValue?.[1]?.displayValue,
                      textColor: item.presentValue?.[0]?.textColor,
                    },
              ['Total Earnings']:
                typeof item.totalEarnings === 'string'
                  ? {
                      value: item.totalEarnings,
                    }
                  : {
                      value: item.totalEarnings[0]?.isNegative
                        ? `-${item.totalEarnings[0]?.displayValue}`
                        : item.totalEarnings[0]?.displayValue,
                      description: item.totalEarnings?.[1]?.displayValue,
                      textColor: item.totalEarnings?.[0]?.textColor,
                    },
            }}
            key={i}
            onViewDetails={() => {}}
          />
        ))}
      </Box>
    </Container>
  );
};

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderTop: `1px solid ${theme.palette.borders.default}`,
  background: theme.palette.background.paper,
  paddingTop: theme.spacing(2),
}));

const Heading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  color: theme.palette.typography.light,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export default LeverageVaultsOverview;
