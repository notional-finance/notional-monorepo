import { Box, useTheme } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { SideBarSubHeader, useCurrencyInputRef } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { SelectConvertAsset } from './components/select-convert-asset';
import { messages } from './messages';
import { useState } from 'react';

export const RollDebt = () => {
  const theme = useTheme();
  const context = useTradeContext('RollDebt');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { debt },
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
      collateralBalance: inputAmount,
      maxWithdraw: maxBalance && inputAmount?.eq(maxBalance),
    });
  };

  return (
    <Box>
      <Box sx={{ display: debt === undefined ? 'block' : 'none' }}>
        <SelectConvertAsset context={context} hasUserTouched={hasUserTouched} />
      </Box>
      {debt && (
        <PortfolioSideDrawer
          context={context}
          enablePrimeBorrow={debt?.tokenType === 'PrimeDebt'}
        >
          <SideBarSubHeader
            callback={() => updateState({ debt: undefined })}
            sx={{
              position: 'absolute',
              top: 0,
              background: theme.palette.background.paper,
            }}
            titleText={defineMessage({ defaultMessage: 'Back' })}
          />
          <AssetInput
            ref={currencyInputRef}
            debtOrCollateral="Collateral"
            context={context}
            prefillMax
            onBalanceChange={onBalanceChange}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </Box>
  );
};
