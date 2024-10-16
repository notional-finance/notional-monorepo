import { useCallback, useContext, useState } from 'react';
import { LiquidityContext } from '../../liquidity';
import {
  LeverageSlider,
  TransactionSidebar,
  useLeveragedNTokenPositions,
} from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { usePrimeCash } from '@notional-finance/notionable-hooks';
import { ErrorMessage } from '@notional-finance/mui';

export const AdjustLeverage = () => {
  const context = useContext(LiquidityContext);
  const {
    state: {
      selectedDepositToken,
      debt,
      collateral,
      deposit,
      calculateError,
      selectedNetwork,
    },
    updateState,
  } = context;
  const { currentPosition } = useLeveragedNTokenPositions(
    selectedNetwork,
    selectedDepositToken
  );
  const primeCash = usePrimeCash(debt?.currencyId);
  const [isDeleverage, setIsDeleverage] = useState(false);

  // NOTE: when the leverage slider goes below the account's default position
  // then we need to swap the debt and collateral tokens
  const onChange = useCallback(
    (leverageRatio: number) => {
      if (!isFinite(leverageRatio)) return;

      if (currentPosition) {
        // NOTE: these state updates reset the context and cause a double calculation
        // due to available collateral tokens changing...
        if (
          leverageRatio >= currentPosition.leverageRatio &&
          (debt?.id !== currentPosition.debt.balance.tokenId ||
            collateral?.id !== currentPosition.asset.balance.tokenId)
        ) {
          setIsDeleverage(false);
          updateState({
            collateral: currentPosition.asset.balance.token,
            debt: currentPosition.debt.balance.token,
            collateralBalance: undefined,
            debtBalance: undefined,
          });
        } else if (
          leverageRatio < currentPosition.leverageRatio &&
          (debt?.id !== currentPosition.asset.balance.tokenId ||
            collateral?.id !== currentPosition.debt.balance.tokenId)
        ) {
          setIsDeleverage(true);
          updateState({
            collateral:
              currentPosition.debt.balance.tokenType === 'PrimeDebt'
                ? primeCash
                : currentPosition.debt.balance.token,
            debt: currentPosition.asset.balance.token,
            collateralBalance: undefined,
            debtBalance: undefined,
          });
        }

        updateState({
          riskFactorLimit: {
            riskFactor: 'leverageRatio',
            limit: leverageRatio,
            args: [currentPosition.asset.balance.currencyId],
          },
        });
      }
    },
    [currentPosition, debt, collateral, updateState, primeCash]
  );

  return (
    <TransactionSidebar
      context={context}
      riskComponent={<LiquidityDetailsTable />}
    >
      <LeverageSlider
        context={context}
        leverageCurrencyId={deposit?.currencyId}
        isDeleverage={isDeleverage}
        showMinMax
        inputLabel={defineMessage({
          defaultMessage: 'Specify Leverage',
        })}
        onChange={onChange}
      />
      {calculateError && (
        <ErrorMessage message={calculateError} variant="error" />
      )}
    </TransactionSidebar>
  );
};
