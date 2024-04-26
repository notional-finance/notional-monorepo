import { useContext } from 'react';
import { ErrorMessage, useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MobileTradeActionSummary,
  TransactionSidebar,
  tradeErrors,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import { BorrowVariableContext } from '../borrow-variable';
import { usePrimeCashBalance } from '@notional-finance/notionable-hooks';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { Box, useTheme } from '@mui/material';

export const BorrowVariableSidebar = () => {
  const theme = useTheme();
  const context = useContext(BorrowVariableContext);
  const {
    state: { selectedDepositToken, debtOptions, selectedNetwork },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();
  const cashBalance = usePrimeCashBalance(
    selectedDepositToken,
    selectedNetwork
  );
  const insufficientLiquidity = debtOptions?.find((_) => !!_)?.error
    ? tradeErrors.insufficientLiquidity
    : undefined;

  return (
    <Box>
      <MobileTradeActionSummary
        selectedToken={selectedDepositToken}
        tradeAction={PRODUCTS.BORROW_VARIABLE}
        state={context.state}
      />
      <TransactionSidebar
        context={context}
        showDrawer
        isWithdraw
        variableBorrowRequired
        NetworkSelector={
          <TransactionNetworkSelector
            product={PRODUCTS.BORROW_VARIABLE}
            context={context}
          />
        }
        mobileTopMargin={theme.spacing(16)}
      >
        <DepositInput
          showScrollPopper
          isWithdraw
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          context={context}
          newRoute={(newToken) =>
            `/${PRODUCTS.BORROW_VARIABLE}/${selectedNetwork}/${newToken}`
          }
          inputLabel={defineMessage({
            defaultMessage: 'Enter amount to borrow',
            description: 'input label',
          })}
          errorMsgOverride={insufficientLiquidity}
        />
        {cashBalance?.isPositive() && (
          <ErrorMessage
            variant="warning"
            title={<FormattedMessage defaultMessage="Existing Cash Balance" />}
            message={
              <FormattedMessage
                defaultMessage="Existing positive balance of {balance} will be withdrawn during the borrow."
                values={{
                  balance: cashBalance
                    .toUnderlying()
                    .toDisplayStringWithSymbol(2, true),
                }}
              />
            }
          />
        )}
      </TransactionSidebar>
    </Box>
  );
};

export default BorrowVariableSidebar;
