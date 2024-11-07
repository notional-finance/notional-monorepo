import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';

export const LendFixedSidebar = () => {
  const theme = useTheme();
  const context = useContext(LendFixedContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const selectedNetwork = context.tradeModel?.selectedNetwork;
  const selectedDepositToken = context.tradeModel?.selectedDepositToken;

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
};

export default LendFixedSidebar;
