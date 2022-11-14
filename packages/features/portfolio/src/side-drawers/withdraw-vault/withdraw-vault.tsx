import { Box } from '@mui/material';
import {
  CurrencyInput,
  InputLabel,
  Button,
  CurrencyInputHandle,
} from '@notional-finance/mui';
import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/src/config/constants';
import { TradePropertiesGrid } from '@notional-finance/trade';
import { useQueryParams } from '@notional-finance/utils';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';
import { useWithdrawVault } from './use-withdraw-vault';

export const WithdrawVault = () => {
  const { vaultAddress } = useQueryParams();
  const inputOverrideRef = useRef<CurrencyInputHandle>(null);

  const {
    canSubmit,
    transactionData,
    sideDrawerInfo,
    isPostMaturityExit,
    error,
    maxWithdrawAmountString,
    isFullRepayment,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateWithdrawVaultState,
  } = useWithdrawVault(vaultAddress);

  return (
    <VaultSideDrawer
      action={
        isPostMaturityExit
          ? PORTFOLIO_ACTIONS.WITHDRAW_VAULT_POST_MATURITY
          : PORTFOLIO_ACTIONS.WITHDRAW_VAULT
      }
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={vaultAddress}
      updatedVaultAccount={updatedVaultAccount}
    >
      {isPostMaturityExit && (
        <Box>
          <Link to={`/vaults/${vaultAddress}`}>
            <Button variant="contained" sx={{ width: '100%' }}>
              <FormattedMessage
                {...messages[PORTFOLIO_ACTIONS.WITHDRAW_VAULT_POST_MATURITY][
                  'reenterVault'
                ]}
              />
            </Button>
          </Link>
        </Box>
      )}
      {!isPostMaturityExit && primaryBorrowSymbol && (
        <Box>
          <InputLabel
            inputLabel={
              messages[PORTFOLIO_ACTIONS.WITHDRAW_VAULT]['inputLabel']
            }
          />
          <CurrencyInput
            placeholder="0.00000000"
            ref={inputOverrideRef}
            decimals={INTERNAL_TOKEN_DECIMAL_PLACES}
            onMaxValue={() => {
              inputOverrideRef.current?.setInputOverride(
                maxWithdrawAmountString
              );
              updateWithdrawVaultState({ maxWithdraw: true });
            }}
            onInputChange={(withdrawAmountString) => {
              updateWithdrawVaultState({
                withdrawAmountString,
                maxWithdraw: false,
              });
            }}
            errorMsg={error && <FormattedMessage {...error} />}
            captionMsg={
              isFullRepayment && (
                <FormattedMessage
                  {...messages[PORTFOLIO_ACTIONS.WITHDRAW_VAULT][
                    'fullRepaymentInfo'
                  ]}
                />
              )
            }
            currencies={[primaryBorrowSymbol]}
            defaultValue={primaryBorrowSymbol}
            onSelectChange={() => {
              /* No Token Select */
            }}
          />
        </Box>
      )}
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
    </VaultSideDrawer>
  );
};
