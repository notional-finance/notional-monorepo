import { FormattedMessage } from 'react-intl';
import { LEND_BORROW } from '@notional-finance/shared-config';
// @ts-ignore
import Chart from '../chart';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
} from '@notional-finance/mui';
import { useNotional } from '@notional-finance/notionable-hooks';
import { TradeActionView } from './trade-action-view';
import { CalculatedRatesTable } from './calculated-rates-table';
import { Market } from '@notional-finance/sdk/src/system';
import { useQueryParams } from '@notional-finance/utils';
import { messages } from './messages';
interface TradeActionSummaryProps {
  markets: Market[];
  selectedToken: string | null;
  selectedMarketKey: string | null;
  onSelectMarketKey: (marketKey: string | null) => void;
  tradeAction: LEND_BORROW;
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
  if (!loaded || !selectedToken) return <PageLoading />;

  return (
    <TradeSummaryContainer>
      <div id="trade-action-view-left-content">
        <TradeActionHeader
          token={selectedToken}
          actionText={<FormattedMessage {...messages[tradeAction].title} />}
        />

        <TradeActionTitle
          value={tradedRate ? (tradedRate * 100) / 1e9 : undefined}
          title={<FormattedMessage defaultMessage={'Fixed APY'} />}
          valueSuffix="%"
        />

        <Chart
          markets={markets}
          currency={selectedToken}
          selectedMarketKey={selectedMarketKey || ''}
          setSelectedMarket={onSelectMarketKey}
          unsetSelectedMarket={() => onSelectMarketKey(null)}
          lockSelection={!!confirm}
        />

        <TradeActionView
          selectedMarketKey={selectedMarketKey}
          tradeAction={tradeAction}
          fCashAmount={fCashAmount}
          interestAmount={interestAmount}
          selectedToken={selectedToken}
        />

        {(tradeAction === LEND_BORROW.BORROW ||
          tradeAction === LEND_BORROW.LEND) && (
          <CalculatedRatesTable
            selectedMarketKey={selectedMarketKey}
            selectedToken={selectedToken}
            tradeAction={tradeAction}
          />
        )}
      </div>
    </TradeSummaryContainer>
  );
}

export default TradeActionSummary;
