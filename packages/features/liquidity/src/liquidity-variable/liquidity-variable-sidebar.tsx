import {
  DepositInput,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { PRODUCTS } from '@notional-finance/util';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const LiquidityVariableSidebar = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { currencyInputRef } = useCurrencyInputRef();
  const selectedNetwork = trade?.selectedNetwork;
  const selectedDepositToken = trade?.selectedDepositToken;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.LIQUIDITY_VARIABLE}
      />
      <TransactionSidebar
        showDrawer
        NetworkSelector={
          <TransactionNetworkSelector product={PRODUCTS.LIQUIDITY_VARIABLE} />
        }
        mobileTopMargin={theme.spacing(16)}
      >
        <DepositInput
          showScrollPopper
          ref={currencyInputRef}
          inputRef={currencyInputRef}
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
