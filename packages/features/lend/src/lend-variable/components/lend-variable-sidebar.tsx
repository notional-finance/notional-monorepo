import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const LendVariableSidebar = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { currencyInputRef } = useCurrencyInputRef();
  const selectedDepositToken = trade?.selectedDepositToken;
  const selectedNetwork = trade?.selectedNetwork;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.LEND_VARIABLE}
      />
      <TransactionSidebar
        showDrawer
        NetworkSelector={
          <TransactionNetworkSelector product={PRODUCTS.LEND_VARIABLE} />
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
