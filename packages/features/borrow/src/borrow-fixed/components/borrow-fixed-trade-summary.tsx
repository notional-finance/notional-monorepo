import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  useTotalsData,
  useFixedLiquidityPoolsTable,
  useBorrowFixedChart,
  useBorrowFixedFaq,
} from '../hooks';
import { HowItWorksFaq } from './how-it-works-faq';
import {
  Faq,
  FaqHeader,
  TotalBox,
  DataTable,
  InteractiveAreaChart,
} from '@notional-finance/mui';
import { BorrowFixedContext } from '../../borrow-fixed/borrow-fixed';
import { TradeActionSummary, useMaturitySelect } from '@notional-finance/trade';

export const BorrowFixedTradeSummary = () => {
  const theme = useTheme();
  const {
    state: { selectedDepositToken },
  } = useContext(BorrowFixedContext);
  const { maturityData, selectedfCashId } = useMaturitySelect(
    'Debt',
    BorrowFixedContext
  );
  const { tableColumns, tableData } =
    useFixedLiquidityPoolsTable(selectedDepositToken);
  const { areaChartData, onSelect, legendData, chartToolTipData } =
    useBorrowFixedChart();
  const totalApy = maturityData.find(
    (m) => m.tokenId === selectedfCashId
  )?.tradeRate;
  const { faqs, faqHeaderLinks } = useBorrowFixedFaq();
  const totalsData = useTotalsData(selectedDepositToken);

  return (
    <TradeActionSummary
      selectedToken={selectedDepositToken || null}
      tradeActionTitle={<FormattedMessage defaultMessage={'Fixed APY'} />}
      tradedRate={totalApy}
      tradeActionHeader={<FormattedMessage defaultMessage={'Borrow'} />}
    >
      {areaChartData.length > 0 && (
        <InteractiveAreaChart
          interactiveAreaChartData={areaChartData}
          onSelectMarketKey={onSelect}
          selectedMarketKey={selectedfCashId}
          chartToolTipData={chartToolTipData}
          legendData={legendData}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          gap: theme.spacing(5),
          marginBottom: theme.spacing(3),
          marginTop: theme.spacing(3),
        }}
      >
        {totalsData.map(({ title, value }, index) => (
          <TotalBox title={title} value={value} key={index} />
        ))}
      </Box>

      {selectedDepositToken && (
        <Faq
          question={<FormattedMessage defaultMessage={'How it Works'} />}
          componentAnswer={<HowItWorksFaq tokenSymbol={selectedDepositToken} />}
          questionDescription={
            <FormattedMessage
              defaultMessage={
                'Learn how fixed rate borrowing works using f{selectedDepositToken}.'
              }
              values={{
                selectedDepositToken,
              }}
            />
          }
        />
      )}
      {tableColumns.length > 0 && tableData.length > 0 && (
        <DataTable
          data={tableData}
          columns={tableColumns}
          tableTitle={
            <FormattedMessage defaultMessage={'Fixed Rate Liquidity Pools'} />
          }
        />
      )}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Fixed Borrow FAQ'} />}
        links={faqHeaderLinks}
      />
      {faqs.map(({ question, answer, componentAnswer }, index) => (
        <Faq
          key={index}
          question={question}
          answer={answer}
          componentAnswer={componentAnswer}
          sx={{
            marginBottom: theme.spacing(2),
            boxShadow: theme.shape.shadowStandard,
            border: 'none',
          }}
        />
      ))}
    </TradeActionSummary>
  );
};

export default BorrowFixedTradeSummary;
