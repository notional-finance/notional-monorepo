import { useHistoricalReturns } from './use-historical-returns';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { countUpLeverageRatio } from '@notional-finance/trade';
import { VaultActionContext } from '../managers';
import { messages } from '../messages';

export const usePerformanceChart = () => {
  const { historicalReturns, currentBorrowRate } = useHistoricalReturns();
  const { state } = useContext(VaultActionContext);
  const { leverageRatio } = state || {};

  const areaChartData = historicalReturns.map((item) => {
    return {
      timestamp: item?.timestamp,
      line: item?.totalRate,
      area: item?.leveragedReturn ? item?.leveragedReturn : 0,
    };
  });

  const areaHeaderData = {
    leftHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: currentBorrowRate ? (
      <FormattedMessage
        {...messages.summary.leveragedReturns}
        values={{
          leverageRatio: leverageRatio
            ? countUpLeverageRatio(leverageRatio)
            : '',
        }}
      />
    ) : undefined,
    legendTwo: <FormattedMessage defaultMessage={'Unleveraged Returns'} />,
  };

  return { areaChartData, areaHeaderData };
};
