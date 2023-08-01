import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useTotalsData } from '../hooks';
import { TotalBox } from '@notional-finance/mui';
import { BorrowFixedContext } from '../../borrow-fixed/borrow-fixed';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { TradeActionSummary, useMaturitySelect } from '@notional-finance/trade';

export const BorrowFixedTradeSummary = () => {
  const theme = useTheme();
  const {
    state: { selectedDepositToken },
  } = useTradeContext('BorrowFixed');
  const { maturityData, selectedfCashId } = useMaturitySelect(
    'Collateral',
    BorrowFixedContext
  );

  const totalApy = maturityData.find(
    (m) => m.tokenId === selectedfCashId
  )?.tradeRate;
  const totalsData = useTotalsData(selectedDepositToken);

  return (
    <TradeActionSummary
      selectedToken={selectedDepositToken || null}
      tradeActionTitle={<FormattedMessage defaultMessage={'Fixed APY'} />}
      tradedRate={totalApy}
      tradeActionHeader={<FormattedMessage defaultMessage={'Borrow'} />}
    >
      <Box
        sx={{
          display: 'flex',
          gap: theme.spacing(5),
          marginBottom: theme.spacing(3),
        }}
      >
        {totalsData.map(({ title, value }, index) => (
          <TotalBox title={title} value={value} key={index} />
        ))}
      </Box>
    </TradeActionSummary>
  );
};

export default BorrowFixedTradeSummary;
