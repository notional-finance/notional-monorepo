import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { HowItWorksFaq } from './how-it-works-faq';
import { Faq, FaqHeader, TotalBox } from '@notional-finance/mui';
import {
  useLendFixedFaq,
  useTotalsData,
  useFixedLiquidityPoolsTable,
} from '../hooks';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import { TradeActionSummary, useMaturitySelect } from '@notional-finance/trade';

export const LendFixedTradeSummary = () => {
  const theme = useTheme();
  const {
    state: { selectedDepositToken },
  } = useContext(LendFixedContext);
  const { maturityData, selectedfCashId } = useMaturitySelect(
    'Collateral',
    LendFixedContext
  );
  useFixedLiquidityPoolsTable(selectedDepositToken);
  const { faqHeaderLinks, faqs } = useLendFixedFaq();
  const totalApy = maturityData.find(
    (m) => m.tokenId === selectedfCashId
  )?.tradeRate;
  const totalsData = useTotalsData(selectedDepositToken);

  return (
    <TradeActionSummary
      selectedToken={selectedDepositToken || null}
      tradeActionTitle={<FormattedMessage defaultMessage={'Fixed APY'} />}
      tradedRate={totalApy}
      tradeActionHeader={<FormattedMessage defaultMessage={'Lend'} />}
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

      {selectedDepositToken && (
        <Faq
          question={<FormattedMessage defaultMessage={'How it Works'} />}
          componentAnswer={<HowItWorksFaq tokenSymbol={selectedDepositToken} />}
          questionDescription={
            <FormattedMessage
              defaultMessage={
                'Learn how fixed rate lending works using f{selectedDepositToken}.'
              }
              values={{
                selectedDepositToken,
              }}
            />
          }
        />
      )}
      {/* {selectedDepositToken && (
          <CalculatedRatesTable
            selectedMarketKey={selectedMarketKey}
            selectedToken={selectedDepositToken}
            tradeAction={NOTIONAL_CATEGORIES.LEND}
          />
        )} */}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Fixed Lend FAQ'} />}
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

export default LendFixedTradeSummary;
