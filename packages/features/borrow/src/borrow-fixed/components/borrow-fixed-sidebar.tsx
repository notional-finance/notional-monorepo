import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  MobileTradeActionSummary,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  usePrimeCashBalance,
} from '@notional-finance/notionable-hooks';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
export const BorrowFixedSidebar = observer(() => {
  const theme = useTheme();
  const { currencyInputRef } = useCurrencyInputRef();
  const trade = useCurrentTradeContext();
  const selectedDepositToken = trade?.selectedDepositToken;
  const selectedNetwork = trade?.selectedNetwork;
  const cashBalance = usePrimeCashBalance(
    selectedDepositToken,
    selectedNetwork
  );

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.BORROW_FIXED}
      />
      <TransactionSidebar
        showDrawer
        isWithdraw
        // If the cash balance is negative, then the account will require
        // prime borrow to be enabled, even though a further negative balance
        // will not be incurred
        variableBorrowRequired={cashBalance?.isNegative()}
        NetworkSelector={
          <TransactionNetworkSelector product={PRODUCTS.BORROW_FIXED} />
        }
        mobileTopMargin={theme.spacing(16)}
      >
        <DepositInput
          isWithdraw
          showScrollPopper
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          newRoute={(newToken) =>
            `/${PRODUCTS.BORROW_FIXED}/${selectedNetwork}/${newToken}`
          }
          inputLabel={defineMessage({
            defaultMessage: 'Enter amount to borrow',
            description: 'input label',
          })}
        />
        <MaturitySelect
          category={'Debt'}
          inputLabel={defineMessage({
            defaultMessage: 'Select a maturity & fix your rate',
            description: 'input label',
          })}
        />
      </TransactionSidebar>
    </Box>
  );
});

export default BorrowFixedSidebar;
