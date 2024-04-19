import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';

export const LendVariableSidebar = () => {
  const theme = useTheme();
  const context = useContext(LendVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { selectedNetwork, selectedDepositToken } = context.state;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.LEND_VARIABLE}
        state={context.state}
      />
      <TransactionSidebar
        context={context}
        showDrawer
        NetworkSelector={
          <TransactionNetworkSelector
            product={PRODUCTS.LEND_VARIABLE}
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
            `/${PRODUCTS.LEND_VARIABLE}/${selectedNetwork}/${newToken}`
          }
          inputLabel={defineMessage({
            defaultMessage: 'How much do you want to lend?',
            description: 'input label',
          })}
        />
      </TransactionSidebar>
    </Box>
  );
};

export default LendVariableSidebar;
