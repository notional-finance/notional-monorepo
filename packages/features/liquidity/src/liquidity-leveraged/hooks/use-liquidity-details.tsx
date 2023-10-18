import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import {
  useAllMarkets,
  usePortfolioLiquidationRisk,
} from '@notional-finance/notionable-hooks';
import { useLeveragedNTokenPositions } from './use-leveraged-ntoken-positions';
import {
  formatLeverageRatio,
  formatMaturity,
  formatNumberAsPercentWithUndefined,
} from '@notional-finance/helpers';
import {
  RATE_PRECISION,
  getChangeType,
  leveragedYield,
} from '@notional-finance/util';
import { Registry } from '@notional-finance/core-entities';

export const useLiquidityDetails = () => {
  const { state } = useContext(LiquidityContext);
  const {
    selectedDepositToken,
    comparePortfolio,
    collateralBalance,
    debtBalance,
    debtOptions,
  } = state;
  const { tableData, tooRisky, onlyCurrent } =
    usePortfolioLiquidationRisk(state);
  const {
    yields: { liquidity },
  } = useAllMarkets();
  const { currentHoldings } = useLeveragedNTokenPositions(selectedDepositToken);
  const newDebt = comparePortfolio?.find(
    ({ updated }) =>
      updated.underlying.symbol === selectedDepositToken && updated.isNegative()
  )?.updated;
  const newAsset = comparePortfolio?.find(
    ({ updated }) =>
      updated.underlying.symbol === selectedDepositToken &&
      updated.tokenType === 'nToken'
  )?.updated;

  let newLeverageRatio;
  let newNetWorth;
  if (newDebt && newAsset) {
    newNetWorth = newAsset.toUnderlying().add(newDebt.toUnderlying());
    newLeverageRatio =
      newDebt.toUnderlying().neg().ratioWith(newNetWorth).toNumber() /
      RATE_PRECISION;
  }

  const currentNTokenAPY = liquidity.find(
    ({ underlying }) => underlying.symbol === selectedDepositToken
  )?.totalAPY;
  const netNTokens =
    collateralBalance?.tokenType === 'nToken'
      ? collateralBalance
      : debtBalance?.tokenType === 'nToken'
      ? debtBalance
      : undefined;
  const newNTokenAPY = netNTokens
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(netNTokens)?.totalAPY
    : currentNTokenAPY;

  const currentAPY = leveragedYield(
    currentNTokenAPY,
    currentHoldings?.borrowAPY,
    currentHoldings?.leverageRatio
  );
  const newAPY = leveragedYield(
    newNTokenAPY,
    currentHoldings?.borrowAPY,
    currentHoldings?.leverageRatio
  );

  const maturity = currentHoldings?.debt.marketYield?.token.maturity;
  const [healthFactorRow] = tableData;
  const table = [
    {
      label: 'Total APY',
      current: formatNumberAsPercentWithUndefined(currentAPY, '-'),
      updated: {
        value: formatNumberAsPercentWithUndefined(newAPY, '-'),
        arrowUp: getChangeType(currentAPY, newAPY) === 'increase',
        checkmark: getChangeType(currentAPY, newAPY) === 'cleared',
        greenOnCheckmark: false,
        greenOnArrowUp: true,
      },
    },
    {
      label: 'Net Worth',
      current:
        currentHoldings?.presentValue.toDisplayStringWithSymbol(3) || '-',
      updated: {
        value: newNetWorth?.toDisplayStringWithSymbol(3) || '-',
        arrowUp:
          getChangeType(
            currentHoldings?.presentValue.toFloat(),
            newNetWorth?.toFloat()
          ) === 'increase',
        checkmark:
          getChangeType(
            currentHoldings?.presentValue.toFloat(),
            newNetWorth?.toFloat()
          ) === 'cleared',
        greenOnCheckmark: false,
        greenOnArrowUp: true,
      },
    },
    {
      label: 'Leverage Ratio',
      current: currentHoldings?.leverageRatio
        ? formatLeverageRatio(currentHoldings?.leverageRatio)
        : '-',
      updated: {
        value: newLeverageRatio ? formatLeverageRatio(newLeverageRatio) : '-',
        arrowUp:
          getChangeType(currentHoldings?.leverageRatio, newLeverageRatio) ===
          'increase',
        checkmark:
          getChangeType(currentHoldings?.leverageRatio, newLeverageRatio) ===
          'cleared',
        greenOnCheckmark: true,
        greenOnArrowUp: false,
      },
    },
    {
      label: healthFactorRow.label,
      current: healthFactorRow.current,
      updated: {
        value: healthFactorRow.updated,
        arrowUp: healthFactorRow.changeType === 'increase',
        checkmark: healthFactorRow.changeType === 'cleared',
        greenOnCheckmark: true,
        greenOnArrowUp: true,
      },
    },
  ];

  if (currentHoldings?.debt.marketYield?.token.tokenType === 'fCash') {
    let newBorrowRate = debtOptions?.find(
      (t) =>
        t.token.id === newDebt?.tokenId ||
        (t.token.tokenType === 'PrimeDebt' &&
          newDebt?.tokenType === 'PrimeCash')
    )?.interestRate;

    if (
      newDebt?.tokenType === 'fCash' &&
      debtBalance &&
      currentHoldings.borrowAPY !== undefined &&
      newBorrowRate !== undefined
    ) {
      // In this case, the user is borrowing more fCash and we need to average in the new fixed rate.
      // In any other case, including withdrawing fCash, the borrow APY will not change.
      // [newBalance * prevImpliedRate - netBalance * (newRate - prevRate)] / newBalance
      newBorrowRate =
        (newDebt.toFloat() * currentHoldings.borrowAPY -
          debtBalance.toFloat() * (newBorrowRate - currentHoldings.borrowAPY)) /
        newDebt.toFloat();
    }

    table.push({
      label: 'Borrow Rate',
      current: formatNumberAsPercentWithUndefined(
        currentHoldings.borrowAPY,
        '-'
      ),
      updated: {
        value: formatNumberAsPercentWithUndefined(newBorrowRate, '-'),
        arrowUp:
          getChangeType(currentHoldings.borrowAPY, newBorrowRate) ===
          'increase',
        checkmark:
          getChangeType(currentHoldings.borrowAPY, newBorrowRate) === 'cleared',
        greenOnCheckmark: false,
        greenOnArrowUp: false,
      },
    });
  }

  return {
    onlyCurrent,
    tableData: table,
    maturity: maturity ? formatMaturity(maturity) : '',
    tooRisky,
  };
};
