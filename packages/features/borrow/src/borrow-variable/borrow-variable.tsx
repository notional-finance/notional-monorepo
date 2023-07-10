import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { BorrowVariableSidebar } from './components';
import {
  SideBarLayout,
  FeatureLoader,
  InteractiveAreaChart,
} from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { TradeActionSummary } from '@notional-finance/trade';
import { updateBorrowState } from '../store/borrow-store';
import { useBorrowTransaction } from '../store/use-borrow-transaction';
import { useQueryParams } from '@notional-finance/utils';
import { useBorrow } from '../store/use-borrow';
import { useEffect } from 'react';
import { useBorrowChart } from './hooks/use-borrow-chart';
import { Market } from '@notional-finance/sdk/system';

export interface BorrowParams {
  selectedDepositToken: string;
  selectedCollateralToken: string;
}

export const BorrowVariable = () => {
  const { selectedDepositToken: selectedToken } = useParams<BorrowParams>();
  const { confirm } = useQueryParams();
  const markets = [] as Market[];
  const { marketData, areaHeaderData, chartToolTipData } =
    useBorrowChart(markets);
  const txnData = useBorrowTransaction(selectedToken);
  const showTransactionConfirmation = txnData ? true : false;
  const { selectedMarketKey, tradedRate } = useBorrow(selectedToken);

  useEffect(() => {
    if (selectedToken) updateBorrowState({ selectedMarketKey: null });
  }, [selectedToken]);

  return (
    <FeatureLoader featureLoaded={markets.length > 0}>
      <SideBarLayout
        showTransactionConfirmation={showTransactionConfirmation}
        sideBar={<BorrowVariableSidebar />}
        mainContent={
          <TradeActionSummary
            selectedToken={selectedToken}
            tradeActionTitle={
              <FormattedMessage defaultMessage={'Variable APY'} />
            }
            tradedRate={tradedRate}
            tradeAction={NOTIONAL_CATEGORIES.BORROW}
          >
            <InteractiveAreaChart
              interactiveAreaChartData={marketData}
              legendData={areaHeaderData}
              onSelectMarketKey={(selectedMarketKey) => {
                updateBorrowState({ selectedMarketKey });
              }}
              selectedMarketKey={selectedMarketKey || ''}
              lockSelection={!!confirm}
              chartToolTipData={chartToolTipData}
            />
          </TradeActionSummary>
        }
      />
    </FeatureLoader>
  );
};

export default BorrowVariable;
