import { useContext } from 'react';
import {
  DepositInput,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';

export const LiquidityVariableSidebar = () => {
  const theme = useTheme();
  const context = useContext(LiquidityContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { selectedNetwork, selectedDepositToken } = context.state;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.LIQUIDITY_VARIABLE}
        state={context.state}
      />
      <TransactionSidebar
        context={context}
        showDrawer
        NetworkSelector={
          <TransactionNetworkSelector
            product={PRODUCTS.LIQUIDITY_VARIABLE}
            context={context}
          />
        }
        mobileTopMargin={theme.spacing(16)}
      >
        <DepositInput
          showScrollPopper
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          context={context}
          newRoute={(newToken) =>
            `/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedNetwork}/${newToken}`
          }
          inputLabel={defineMessage({
            defaultMessage: 'Enter amount to deposit for liquidity',
            description: 'input label',
          })}
        />
      </TransactionSidebar>
    </Box>
  );
};

export default LiquidityVariableSidebar;
