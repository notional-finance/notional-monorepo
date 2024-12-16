import {
  getBoostedData,
  formatNumberAsAbbr,
  checkBoostToken,
} from '@notional-finance/helpers';
import {
  useAllMarkets,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import {
  formatNumberAsPercent,
  Network,
  PRODUCTS,
} from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@notional-finance/notionable-hooks';
import { checkBoostEndDate } from '@notional-finance/notionable/global/account/communities';

export const useFixedRateGrid = (
  network: Network | undefined,
  product: PRODUCTS
) => {
  const {
    yields: { fCashLend, fCashBorrow },
  } = useAllMarkets(network);
  const {
    globalState: { isBoostUser },
  } = useNotionalContext();
  const validBoostDate = checkBoostEndDate();
  const navigate = useNavigate();
  const { baseCurrency } = useAppState();
  const tokenObj = {};
  const isBorrow = product === PRODUCTS.BORROW_FIXED;
  const yieldData = isBorrow ? fCashBorrow : fCashLend;

  const apySubTitle =
    product === PRODUCTS.LEND_FIXED
      ? defineMessage({
          defaultMessage: `AS HIGH AS`,
          description: 'subtitle',
        })
      : defineMessage({
          defaultMessage: `AS LOW AS`,
          description: 'subtitle',
        });

  const allData = yieldData.map((y) => {
    const boostUser = checkBoostToken(y.underlying.symbol, isBoostUser);
    return {
      ...y,
      symbol: y.underlying.symbol,
      title: y.underlying.symbol,
      subTitle: `Liquidity: ${formatNumberAsAbbr(
        y?.liquidity?.toFiat(baseCurrency).toFloat() || 0,
        0,
        baseCurrency
      )}`,
      // TODO: ADD WALLET CHECK HERE
      bottomLeftValue:
        boostUser && !isBorrow && validBoostDate
          ? `boost: ${formatNumberAsPercent(y.totalAPY + 5)} APY`
          : '',
      network: y.token.network,
      hasPosition: false,
      apySubTitle: apySubTitle,
      tvlNum: y?.liquidity ? y.liquidity.toFiat(baseCurrency).toNumber() : 0,
      apy: y.totalAPY,
      routeCallback: () =>
        navigate(`/${product}/${network}/${y.underlying.symbol}`),
    };
  });

  const sortGridData = (isBorrow, allData) => {
    if (isBorrow) {
      return allData
        .sort((a, b) => a.apy - b.apy)
        .filter((data) => {
          if (!tokenObj[data.symbol]) {
            tokenObj[data.symbol] = true;
            return data;
          } else {
            return null;
          }
        })
        .sort((a, b) => b.tvlNum - a.tvlNum);
    } else {
      return allData
        .sort((a, b) => b.apy - a.apy)
        .filter((data) => {
          if (!tokenObj[data.symbol]) {
            tokenObj[data.symbol] = true;
            return data;
          } else {
            return null;
          }
        })
        .sort((a, b) => b.tvlNum - a.tvlNum);
    }
  };

  const sortedData = sortGridData(isBorrow, allData);
  const { newUserBoostedData, nonBoostedData } = getBoostedData(sortedData);

  const gridData =
    isBoostUser && !isBorrow && validBoostDate
      ? [
          {
            sectionTitle: 'Season of Deposits',
            data: newUserBoostedData,
            hasBoost: true,
          },
          {
            sectionTitle: 'NO BOOST',
            data: nonBoostedData,
            hasLeveragedPosition: false,
          },
        ]
      : [
          {
            sectionTitle: '',
            data: sortedData,
            hasLeveragedPosition: false,
          },
        ];

  return {
    gridData: sortedData.length > 0 ? gridData : [],
    setShowNegativeYields: undefined,
    showNegativeYields: undefined,
  };
};
