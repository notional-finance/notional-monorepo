import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PositionCard from '../components/position-card';
import { usePortfolioNOTETable } from '../../../hooks';
import { H4 } from '@notional-finance/mui';

interface IProps {
  data: ReturnType<typeof usePortfolioNOTETable>['noteData'];
}

const NOTEHoldingsOverview = ({ data }: IProps) => {
  const theme = useTheme();

  return (
    <Container>
      <HeadingContainer>
        <H4 sx={{ color: theme.palette.typography.light }}>
          <FormattedMessage
            defaultMessage="NOTE Holdings"
            description="note holdings"
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
              'NOTE Price': {
                value: item.notePrice,
              },
              'Total NOTE': {
                value: item.walletBalance.data[0].displayValue,
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

export default NOTEHoldingsOverview;
