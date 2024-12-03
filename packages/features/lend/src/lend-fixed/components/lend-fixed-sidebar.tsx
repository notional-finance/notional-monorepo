import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

export const LendFixedSidebar = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { currencyInputRef } = useCurrencyInputRef();
  const selectedNetwork = trade?.selectedNetwork;
  const selectedDepositToken = trade?.selectedDepositToken;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.LEND_FIXED}
      />
      <TransactionSidebar
        showDrawer
        NetworkSelector={
          <TransactionNetworkSelector product={PRODUCTS.LEND_FIXED} />
        }
        mobileTopMargin={theme.spacing(16)}
      >
        <DepositInput
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          newRoute={(newToken) =>
            `/${PRODUCTS.LEND_FIXED}/${selectedNetwork}/${newToken}`
          }
          showScrollPopper
          inputLabel={defineMessage({
            defaultMessage: 'Enter amount to lend',
            description: 'input label',
          })}
        />
        <MaturitySelect
          category={'Collateral'}
          inputLabel={defineMessage({
            defaultMessage: 'Select a maturity & fix your rate',
            description: 'input label',
          })}
        />
      </TransactionSidebar>
    </Box>
  );
});

export default LendFixedSidebar;
