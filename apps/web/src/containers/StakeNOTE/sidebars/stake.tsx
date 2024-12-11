import { useCallback, useState } from 'react';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  useCurrentTradeContext,
  useNOTE,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import { observer } from 'mobx-react-lite';

export const Stake = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const setNOTEBalanceForStaking = trade?.setNOTEBalanceForStaking;
  const setETHBalanceForStaking = trade?.setETHBalanceForStaking;
  const setUseOptimalETHForStaking = trade?.setUseOptimalETHForStaking;

  const [hasTouchedETH, setHasTouchedETH] = useState(false);
  const NOTE = useNOTE(Network.mainnet);
  const { currencyInputRef: ethInputRef, setCurrencyInput: setETHInput } =
    useCurrencyInputRef();
  const { currencyInputRef: noteInputRef } = useCurrencyInputRef();

  const onETHUpdate = useCallback(
    (inputAmount: TokenBalance | undefined) => {
      if (inputAmount?.isPositive() && hasTouchedETH === false)
        setHasTouchedETH(true);
      if (setETHBalanceForStaking)
        setETHBalanceForStaking(inputAmount, hasTouchedETH, setETHInput);
    },
    [hasTouchedETH, setETHBalanceForStaking, setETHInput]
  );

  const onNOTEUpdate = useCallback(
    (inputAmount: TokenBalance | undefined) => {
      if (setNOTEBalanceForStaking)
        setNOTEBalanceForStaking(inputAmount, setETHInput);
    },
    [setNOTEBalanceForStaking, setETHInput]
  );

  const onOptimize = useCallback(() => {
    if (setUseOptimalETHForStaking)
      setUseOptimalETHForStaking(true, setETHInput);
  }, [setUseOptimalETHForStaking, setETHInput]);

  return (
    <TransactionSidebar
      riskComponent={<div />}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
    >
      {NOTE && (
        <DepositInput
          showScrollPopper
          ref={noteInputRef}
          inputRef={noteInputRef}
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
        useZeroDefault
        miniButtonLabel={'OPTIMIZE'}
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
});
