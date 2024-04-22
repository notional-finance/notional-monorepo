import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import {
  useAllMarkets,
  usePortfolioLiquidationRisk,
} from '@notional-finance/notionable-hooks';
import {
  formatLeverageRatio,
  formatNumberAsPercentWithUndefined,
} from '@notional-finance/helpers';
import { useLeveragedNTokenPositions } from '@notional-finance/trade';
import {
  formatMaturity,
  RATE_PRECISION,
  getChangeType,
  leveragedYield,
} from '@notional-finance/util';
import { Registry, TokenBalance } from '@notional-finance/core-entities';

export const useLiquidityDetails = () => {
  const { state } = useContext(LiquidityContext);
  const {
    selectedDepositToken,
    comparePortfolio,
    collateralBalance,
    debtBalance,
    debtOptions,
    collateralOptions,
    selectedNetwork,
  } = state;
  const { tableData, tooRisky, onlyCurrent } =
    usePortfolioLiquidationRisk(state);
  const {
    yields: { liquidity },
  } = useAllMarkets(selectedNetwork);
  const { currentHoldings } = useLeveragedNTokenPositions(
    selectedNetwork,
    selectedDepositToken
  );
  const newDebt = comparePortfolio?.find(
    ({ updated }) =>
      updated.underlying.symbol === selectedDepositToken &&
      updated.tokenType !== 'nToken' &&
      updated.isNegative()
  )?.updated;
  const newAsset = comparePortfolio?.find(
    ({ updated }) =>
      updated.underlying.symbol === selectedDepositToken &&
      updated.tokenType === 'nToken'
  )?.updated;

  let newLeverageRatio: number | null | undefined;
  let newNetWorth: TokenBalance | undefined;
  if (newDebt && newAsset) {
    newNetWorth = newAsset.toUnderlying().add(newDebt.toUnderlying());
    newLeverageRatio = newNetWorth.isZero()
      ? null
      : newDebt.toUnderlying().neg().ratioWith(newNetWorth).toNumber() /
        RATE_PRECISION;
  }

  const currentNToken = liquidity.find(
    ({ underlying }) => underlying.symbol === selectedDepositToken
  );
  const netNTokens =
    collateralBalance?.tokenType === 'nToken'
      ? collateralBalance
      : debtBalance?.tokenType === 'nToken'
      ? debtBalance
      : undefined;

  const currentAPY = leveragedYield(
    currentNToken?.totalAPY,
    currentHoldings?.borrowAPY,
    currentHoldings?.leverageRatio
  );

  const newBorrowOption =
    debtOptions?.find(
      (t) =>
        t.token.id === newDebt?.tokenId ||
        (t.token.tokenType === 'PrimeDebt' &&
          newDebt?.tokenType === 'PrimeCash')
    ) ||
    // NOTE: the borrow rate will be "collateral" when reducing the position, however,
    // the "newDebt" variable here always refers to the proper debt token
    collateralOptions?.find(
      (t) =>
        t.token.id === newDebt?.tokenId ||
        (t.token.tokenType === 'PrimeCash' &&
          newDebt?.tokenType === 'PrimeCash')
    );
  const newBorrowRate = newBorrowOption?.interestRate;
  const newNTokenAPY = netNTokens
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(
        netNTokens,
        debtBalance?.token.tokenType === 'PrimeDebt'
          ? debtBalance.toPrimeDebt()
          : collateralBalance?.token.tokenType === 'PrimeCash'
          ? collateralBalance.toPrimeDebt().neg()
          : undefined
      )?.totalAPY
    : currentNToken?.totalAPY;

  let newFixedRate;
  if (
    newDebt?.tokenType === 'fCash' &&
    debtBalance &&
    currentHoldings?.borrowAPY !== undefined &&
    newBorrowRate !== undefined
  ) {
    newFixedRate =
      // If the debt balance is fCash then we average the new fixed rate into the current
      // fixed rate since the user is increasing their position.
      // [newBalance * prevImpliedRate - netBalance * (newRate - prevRate)] / newBalance
      debtBalance.tokenId === newDebt.tokenId
        ? (newDebt.toFloat() * currentHoldings.borrowAPY -
            debtBalance.toFloat() *
              (newBorrowRate - currentHoldings.borrowAPY)) /
          newDebt.toFloat()
        : // If the collateral balance is fCash that means the position is being reduced,
          // and we do not need to change the borrow rate.
          currentHoldings.borrowAPY;
  }

  const newAPY = leveragedYield(newNTokenAPY, newBorrowRate, newLeverageRatio);
  const maturity = currentHoldings?.debt.marketYield?.token.maturity;
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
  ];

  const liquidationPrice = tableData.find(
    ({ asset }) => asset?.id === currentNToken?.token.id
  );
  if (liquidationPrice) {
    table.push({
      label: liquidationPrice.label as string,
      current: liquidationPrice.current,
      updated: {
        value: liquidationPrice.updated,
        arrowUp: liquidationPrice.changeType === 'increase',
        checkmark: liquidationPrice.changeType === 'cleared',
        greenOnCheckmark: true,
        greenOnArrowUp: false,
      },
    });
  }

  if (currentHoldings?.debt.marketYield?.token.tokenType === 'fCash') {
    table.push({
      label: 'Borrow Rate',
      current: formatNumberAsPercentWithUndefined(
        currentHoldings.borrowAPY,
        '-'
      ),
      updated: {
        value: formatNumberAsPercentWithUndefined(newFixedRate, '-'),
        arrowUp:
          getChangeType(currentHoldings.borrowAPY, newFixedRate) === 'increase',
        checkmark:
          getChangeType(currentHoldings.borrowAPY, newFixedRate) === 'cleared',
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
