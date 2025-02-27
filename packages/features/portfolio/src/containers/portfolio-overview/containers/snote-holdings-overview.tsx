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
      <Header>
        <FormattedMessage
          defaultMessage="sNOTE Holdings"
          description="snote holdings"
        />
      </Header>

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

const Header = styled(H2)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  color: theme.palette.typography.light,
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
