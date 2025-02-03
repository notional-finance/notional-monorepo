import { Box, styled, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PositionCard from '../components/position-card';
import { HoldingData } from '../hooks';

interface IProps {
  holdings: HoldingData[];
}

const PortfolioHoldingsOverview = ({ holdings }: IProps) => {
  const formatValue = (
    value:
      | string
      | { data: Array<{ isNegative: boolean; displayValue: string }> },
    index: number
  ): string | null => {
    // If the value is simply a string then return it.
    if (typeof value === 'string') {
      return value;
    }
    // Otherwise, check for the data at the given index.
    if (value.data && value.data[index]) {
      const { isNegative, displayValue } = value.data[index];
      return isNegative ? `-${displayValue}` : displayValue;
    }
    return null;
  };

  return (
    <Container>
      <Heading variant="h2">
        <FormattedMessage
          defaultMessage="Portfolio Holdings"
          description="portfolio holdings"
        />
      </Heading>

      <Box>
        {holdings.map((holding, i) => (
          <PositionCard
            header={{
              tokenSymbol: holding.currency,
              tokenName: holding.currency,
            }}
            data={{
              ['Market APY']: {
                value: formatValue(holding.netWorth, 0),
                description: formatValue(holding.netWorth, 1),
              },
              ['Present Value']: {
                value: formatValue(holding.assets, 0),
                description: formatValue(holding.assets, 1),
              },
              ['Total Earnings']: {
                value: formatValue(holding.debts, 0),
                description: formatValue(holding.debts, 1),
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

export default PortfolioHoldingsOverview;
