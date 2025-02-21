import { Box, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PositionCard from '../components/position-card';
import { usePortfolioSNOTETable } from '../../../hooks';
import { H2 } from '@notional-finance/mui';

interface IProps {
  data: ReturnType<typeof usePortfolioSNOTETable>['data'];
}

const SNOTEHoldingsOverview = ({ data }: IProps) => {
  return (
    <Container>
      <H2>
        <FormattedMessage
          defaultMessage="sNOTE Holdings"
          description="snote holdings"
        />
      </H2>

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

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderTop: `1px solid ${theme.palette.borders.default}`,
  background: theme.palette.background.paper,
  paddingTop: theme.spacing(2),
}));

export default SNOTEHoldingsOverview;
