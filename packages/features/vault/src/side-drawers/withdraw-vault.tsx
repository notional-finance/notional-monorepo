import { Box } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import {
  CurrencyInput,
  ErrorMessage,
  InputLabel,
  PageLoading,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';
import {
  useCurrentTradeContext,
  useVaultMaxWithdraw,
} from '@notional-finance/notionable-hooks';
import { useInputAmount } from '@notional-finance/trade/common';
import { useVaultActionErrors } from '../hooks';
import { observer } from 'mobx-react-lite';

export const WithdrawVault = observer(() => {
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  const trade = useCurrentTradeContext();
  const postVaultFactors = trade?.getPostVaultFactors();
  const { deposit } = trade?.selectedTokens ?? {};
  const depositBalance = trade?.depositBalance;
  const vaultAddress = trade?.vaultAddress;
  const calculateError = trade?.calculateError;
  const maxWithdraw = trade?.maxWithdraw;
  const selectedNetwork = trade?.selectedNetwork;

  const [inputString, setInputString] = useState('');
  const { underMinAccountBorrowError } = useVaultActionErrors();
  const primaryBorrowSymbol = deposit?.symbol;
  const isFullRepayment = postVaultFactors?.leverageRatio === null;
  const maxWithdrawValues = useVaultMaxWithdraw(selectedNetwork, vaultAddress);

  const { inputAmount } = useInputAmount(
    selectedNetwork,
    inputString,
    primaryBorrowSymbol
  );

  useEffect(() => {
    trade?.setDepositBalance(inputAmount?.neg());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade, inputAmount?.hashKey]);

  const maxWithdrawUnderlying = maxWithdrawValues?.maxWithdrawUnderlying;
  const onMaxValue = useCallback(() => {
    if (maxWithdrawUnderlying) {
      setCurrencyInput(maxWithdrawUnderlying?.toExactString(), false);
      trade?.setVaultMaxWithdraw();
    }
  }, [trade, maxWithdrawUnderlying, setCurrencyInput]);

  if (!deposit || !primaryBorrowSymbol) return <PageLoading />;

  return (
    <VaultSideDrawer>
      <Box>
        <InputLabel inputLabel={messages['WithdrawVault']['inputLabel']} />
        <CurrencyInput
          ref={currencyInputRef}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          onInputChange={(withdrawAmountString) => {
            setInputString(withdrawAmountString);
          }}
          onMaxValue={maxWithdrawUnderlying && onMaxValue}
          errorMsg={
            !maxWithdraw &&
            depositBalance &&
            maxWithdrawUnderlying &&
            depositBalance.abs().gt(maxWithdrawUnderlying) ? (
              <FormattedMessage
                {...messages['WithdrawVault'].aboveMaxWithdraw}
                values={{
                  maxWithdraw:
                    maxWithdrawUnderlying?.toDisplayStringWithSymbol(),
                }}
              />
            ) : (
              calculateError
            )
          }
          captionMsg={
            isFullRepayment && (
              <FormattedMessage
                {...messages['WithdrawVault']['fullRepaymentInfo']}
              />
            )
          }
          options={deposit ? [{ token: deposit }] : []}
          defaultValue={deposit?.id || null}
        />
        {underMinAccountBorrowError && (
          <ErrorMessage
            variant={'error'}
            message={<FormattedMessage {...underMinAccountBorrowError} />}
          />
        )}
      </Box>
    </VaultSideDrawer>
  );
});
