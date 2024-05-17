import { useCallback, useContext, useEffect, useState } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useNOTE } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';

export const Stake = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const {
    state: { useOptimalETH, depositBalance },
    updateState,
  } = context;
  const [hasTouchedETH, setHasTouchedETH] = useState(false);
  const NOTE = useNOTE(Network.mainnet);
  const { currencyInputRef: ethInputRef, setCurrencyInput: setETHInput } =
    useCurrencyInputRef();
  const { currencyInputRef: noteInputRef } = useCurrencyInputRef();

  const onNOTEUpdate = useCallback(
    (inputAmount: TokenBalance | undefined) => {
      updateState({ secondaryDepositBalance: inputAmount });
    },
    [updateState]
  );

  const onETHUpdate = useCallback(
    (inputAmount: TokenBalance | undefined) => {
      if (inputAmount !== undefined) setHasTouchedETH(true);
      updateState({
        depositBalance: inputAmount,
        useOptimalETH: inputAmount === undefined && hasTouchedETH === false,
      });
    },
    [updateState, hasTouchedETH]
  );

  const onOptimize = useCallback(() => {
    updateState({ useOptimalETH: true });
  }, [updateState]);

  useEffect(() => {
    if (useOptimalETH && depositBalance)
      setETHInput(depositBalance.toExactString(), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useOptimalETH, depositBalance?.hashKey, setETHInput]);

  return (
    <TransactionSidebar
      riskComponent={<div />}
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
    >
      {NOTE && (
        <DepositInput
          showScrollPopper
          ref={noteInputRef}
          inputRef={noteInputRef}
          context={context}
          excludeSupplyCap
          useZeroDefault
          onUpdate={onNOTEUpdate}
          depositOverride={NOTE}
          depositTokens={[NOTE]}
          inputLabel={defineMessage({
            defaultMessage: 'Enter amount of NOTE to stake:',
          })}
        />
      )}
      <DepositInput
        showScrollPopper
        ref={ethInputRef}
        inputRef={ethInputRef}
        context={context}
        onUpdate={onETHUpdate}
        onMaxValue={onOptimize}
        excludeSupplyCap
        newRoute={(newToken) => `/${PRODUCTS.STAKE_NOTE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: 'Enter amount of ETH or WETH to stake:',
        })}
      />
    </TransactionSidebar>
  );
};
