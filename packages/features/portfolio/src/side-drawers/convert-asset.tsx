import { Box } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { SelectConvertAsset } from './components/select-convert-asset';
import { messages } from './messages';
import { useState } from 'react';

export const ConvertAsset = () => {
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { collateral },
    updateState,
  } = context;
  const [hasUserTouched, setHasUserTouched] = useState<boolean>(false);

  const onBalanceChange = (
    inputAmount: TokenBalance | undefined,
    _: TokenBalance | undefined,
    maxBalance: TokenBalance | undefined
  ) => {
    // Fixes a race condition where the screen flashes
    if (inputAmount === undefined && hasUserTouched === false) return;
    if (inputAmount) setHasUserTouched(true);
    updateState({
      debtBalance: inputAmount,
      maxWithdraw: maxBalance && inputAmount?.neg().eq(maxBalance),
    });
  };

  return (
    <Box>
      <Box sx={{ display: collateral === undefined ? 'block' : 'none' }}>
        <SelectConvertAsset context={context} hasUserTouched={hasUserTouched} />
      </Box>
      {collateral && (
        <PortfolioSideDrawer context={context}>
          <AssetInput
            ref={currencyInputRef}
            debtOrCollateral="Debt"
            prefillMax
            onBalanceChange={onBalanceChange}
            context={context}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </Box>
  );
};
