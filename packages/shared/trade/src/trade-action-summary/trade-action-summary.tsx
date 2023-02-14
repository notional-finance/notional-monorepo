import { FormattedMessage } from 'react-intl';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
  InteractiveAreaChart,
} from '@notional-finance/mui';
import { useTradeSummaryChart } from './hooks/use-trade-summary-chart';
import { useNotional } from '@notional-finance/notionable-hooks';
import { TradeActionView } from './trade-action-view';
import { CalculatedRatesTable } from './calculated-rates-table';
import { Market } from '@notional-finance/sdk/src/system';
import { useQueryParams } from '@notional-finance/utils';
import { MobileTradeActionSummary } from './mobile-trade-action-summary';
import { TradeActionTooltip } from './trade-action-tool-tip';
import { messages } from './messages';
interface TradeActionSummaryProps {
  markets: Market[];
  selectedToken: string | null;
  selectedMarketKey: string | null;
  onSelectMarketKey: (marketKey: string | null) => void;
  tradeAction: NOTIONAL_CATEGORIES;
  tradedRate: number | undefined;
  fCashAmount: number | undefined;
  interestAmount: number | undefined;
}

export function TradeActionSummary({
  markets,
  selectedToken,
  selectedMarketKey,
  tradedRate,
  onSelectMarketKey,
  tradeAction,
  fCashAmount,
  interestAmount,
}: TradeActionSummaryProps) {
  const { confirm } = useQueryParams();
  const { loaded } = useNotional();
  const { marketData, areaHeaderData } = useTradeSummaryChart(markets);
  if (!loaded || !selectedToken) return <PageLoading />;
  const fixedAPY = tradedRate ? (tradedRate * 100) / 1e9 : undefined;

  return (
    <>
      <TradeSummaryContainer>
        <div id="trade-action-view-left-content">
          <TradeActionHeader
            token={selectedToken}
            actionText={<FormattedMessage {...messages[tradeAction].title} />}
          />

          <TradeActionTitle
            value={fixedAPY}
            title={<FormattedMessage defaultMessage={'Fixed APY'} />}
            valueSuffix="%"
          />

          <InteractiveAreaChart
            interactiveAreaChartData={marketData}
            areaHeaderData={areaHeaderData}
            onSelectMarketKey={onSelectMarketKey}
            selectedMarketKey={selectedMarketKey || ''}
            CustomTooltip={TradeActionTooltip}
            lockSelection={!!confirm}
          />

          <TradeActionView
            selectedMarketKey={selectedMarketKey}
            tradeAction={tradeAction}
            fCashAmount={fCashAmount}
            interestAmount={interestAmount}
            selectedToken={selectedToken}
          />

          {(tradeAction === NOTIONAL_CATEGORIES.BORROW ||
            tradeAction === NOTIONAL_CATEGORIES.LEND) && (
            <CalculatedRatesTable
              selectedMarketKey={selectedMarketKey}
              selectedToken={selectedToken}
              tradeAction={tradeAction}
            />
          )}
        </div>
      </TradeSummaryContainer>

      <MobileTradeActionSummary
        tradeAction={tradeAction}
        selectedToken={selectedToken}
        dataPointOne={fCashAmount}
        dataPointOneSuffix={` ${selectedToken}`}
        dataPointTwo={interestAmount}
        dataPointTwoSuffix={` ${selectedToken}`}
        fixedAPY={fixedAPY}
      />
    </>
  );
}

export default TradeActionSummary;
