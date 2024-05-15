import { useContext } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useNOTE } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';

export const Stake = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const NOTE = useNOTE(Network.mainnet);
  const { currencyInputRef: ethInputRef } = useCurrencyInputRef();
  const { currencyInputRef: noteInputRef } = useCurrencyInputRef();

  return (
    <TransactionSidebar
      riskComponent={<div />}
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
    >
      {NOTE && (
        <DepositInput
          showScrollPopper
          ref={noteInputRef}
          inputRef={noteInputRef}
          context={context}
          depositOverride={NOTE}
          depositTokens={[NOTE]}
          inputLabel={defineMessage({
            defaultMessage: 'Enter amount of NOTE to stake:',
          })}
        />
      )}
      <DepositInput
        showScrollPopper
        ref={ethInputRef}
        inputRef={ethInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.STAKE_NOTE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: 'Enter amount of ETH or WETH to stake:',
        })}
      />
    </TransactionSidebar>
  );
};
