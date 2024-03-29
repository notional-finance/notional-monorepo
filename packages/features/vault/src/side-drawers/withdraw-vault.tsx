import { Box } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useNotional } from '@notional-finance/notionable-hooks';
import {
  CurrencyInput,
  InputLabel,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/src/config/constants';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';

export const WithdrawVault = () => {
  const { notional } = useNotional();
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  const { updateState, state } = useContext(VaultActionContext);

  const {
    primaryBorrowSymbol,
    updatedVaultAccount,
    maxWithdrawAmount,
    withdrawAmount,
    maxWithdraw,
  } = state;
  const isFullRepayment = updatedVaultAccount?.primaryBorrowfCash.isZero();

  useEffect(() => {
    if (maxWithdraw && maxWithdrawAmount)
      setCurrencyInput(maxWithdrawAmount.toExactString());
  }, [maxWithdraw, maxWithdrawAmount, setCurrencyInput]);

  return (
    <VaultSideDrawer>
      {primaryBorrowSymbol && (
        <Box>
          <InputLabel
            inputLabel={messages[VAULT_ACTIONS.WITHDRAW_VAULT]['inputLabel']}
          />
          <CurrencyInput
            ref={currencyInputRef}
            placeholder="0.00000000"
            decimals={INTERNAL_TOKEN_DECIMAL_PLACES}
            onInputChange={(withdrawAmountString) => {
              try {
                updateState({
                  withdrawAmount: notional?.parseInput(
                    withdrawAmountString,
                    primaryBorrowSymbol,
                    true
                  ),
                  maxWithdraw: false,
                });
              } catch (e) {
                updateState({
                  withdrawAmount: undefined,
                });
              }
            }}
            onMaxValue={() => {
              updateState({
                maxWithdraw: true,
              });
            }}
            errorMsg={
              withdrawAmount &&
              maxWithdrawAmount &&
              withdrawAmount.gt(maxWithdrawAmount) ? (
                <FormattedMessage
                  {...messages[VAULT_ACTIONS.WITHDRAW_VAULT].aboveMaxWithdraw}
                  values={{
                    maxWithdraw: maxWithdrawAmount?.toDisplayStringWithSymbol(),
                  }}
                />
              ) : undefined
            }
            captionMsg={
              isFullRepayment && (
                <FormattedMessage
                  {...messages[VAULT_ACTIONS.WITHDRAW_VAULT][
                    'fullRepaymentInfo'
                  ]}
                />
              )
            }
            currencies={[primaryBorrowSymbol]}
            defaultValue={primaryBorrowSymbol}
          />
        </Box>
      )}
    </VaultSideDrawer>
  );
};
