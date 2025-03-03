import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { H4 } from '@notional-finance/mui';
import PositionCard from '../components/position-card';
import { usePortfolioSNOTETable } from '../../../hooks';

interface IProps {
  data: ReturnType<typeof usePortfolioSNOTETable>['data'];
}

const SNOTEHoldingsOverview = ({ data }: IProps) => {
  const theme = useTheme();

  return (
    <Container>
      <HeadingContainer>
        <H4 sx={{ color: theme.palette.typography.light }}>
          <FormattedMessage
            defaultMessage="sNOTE Holdings"
            description="snote holdings"
          />
        </H4>
      </HeadingContainer>

      <Box>
        {data.map((item, i) => (
          <PositionCard
            tokenId={item.asset.symbol}
            header={{
              tokenSymbol: item.asset.symbol,
              tokenName: item.asset.label,
              description: item.asset.caption,
            }}
            data={{
              'Market APY': {
                value: item.marketApy,
              },
              'NOTE Price': {
                value: item.noteValue.data[0].displayValue ?? null,
              },
              'ETH Value': {
                value: item.ethValue.data[0].displayValue ?? null,
              },
              'Total Value': {
                value: item.totalValue,
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

export default SNOTEHoldingsOverview;
