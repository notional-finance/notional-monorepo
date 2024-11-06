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
import { observer } from 'mobx-react-lite';

export const LendVariableSidebar = observer(() => {
  const theme = useTheme();
  const context = useContext(LendVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const selectedDepositToken = context.tradeModel?.selectedDepositToken;
  const selectedNetwork = context.tradeModel?.selectedNetwork;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.LEND_VARIABLE}
      />
      <TransactionSidebar
        context={context}
        showDrawer
        NetworkSelector={
          <TransactionNetworkSelector
            context={context}
            product={PRODUCTS.LEND_VARIABLE}
          />
        }
        mobileTopMargin={theme.spacing(16)}
      >
        <DepositInput
          showScrollPopper
          ref={currencyInputRef}
          inputRef={currencyInputRef}
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
});

export default LendVariableSidebar;
