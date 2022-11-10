import { Box } from '@mui/material';
import {
  CurrencyInput,
  InputLabel,
  SliderInput,
  Button,
  CurrencyInputHandle,
  SliderInputHandle,
} from '@notional-finance/mui';
import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/src/config/constants';
import { TradePropertiesGrid } from '@notional-finance/trade';
import { useQueryParams, PORTFOLIO_ACTIONS } from '@notional-finance/utils';
import { useCallback, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';
import { useWithdrawVault } from './use-withdraw-vault';

export const WithdrawVault = () => {
  const { vaultAddress } = useQueryParams();
  const inputOverrideRef = useRef<CurrencyInputHandle>(null);
  const sliderInputRef = useRef<SliderInputHandle>(null);
  const isSliderMounted = !!sliderInputRef.current;
  const setSliderInput = useCallback(
    (input: number) => {
      sliderInputRef.current?.setInputOverride(input);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sliderInputRef, isSliderMounted]
  );

  const {
    canSubmit,
    transactionData,
    sideDrawerInfo,
    isPostMaturityExit,
    error,
    maxWithdrawAmountString,
    sliderInfoMessage,
    primaryBorrowSymbol,
    maxLeverageRatio,
    targetLeverageRatio,
    updatedVaultAccount,
    updateWithdrawVaultState,
  } = useWithdrawVault(vaultAddress);

  useEffect(() => {
    if (targetLeverageRatio && isSliderMounted) setSliderInput(targetLeverageRatio);
  }, [targetLeverageRatio, setSliderInput, isSliderMounted]);

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
                {...messages[PORTFOLIO_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]['reenterVault']}
              />
            </Button>
          </Link>
        </Box>
      )}
      {!isPostMaturityExit && primaryBorrowSymbol && (
        <Box>
          <InputLabel inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW_VAULT]['inputLabel']} />
          <CurrencyInput
            placeholder="0.00000000"
            ref={inputOverrideRef}
            decimals={INTERNAL_TOKEN_DECIMAL_PLACES}
            onMaxValue={() => {
              inputOverrideRef.current?.setInputOverride(maxWithdrawAmountString);
              updateWithdrawVaultState({ maxWithdraw: true });
            }}
            onInputChange={(withdrawAmountString) => {
              updateWithdrawVaultState({ withdrawAmountString, maxWithdraw: false });
            }}
            errorMsg={error && <FormattedMessage {...error} />}
            currencies={[primaryBorrowSymbol]}
            defaultValue={primaryBorrowSymbol}
            onSelectChange={() => {
              /* No Token Select */
            }}
          />
        </Box>
      )}
      {!isPostMaturityExit && (
        <SliderInput
          ref={sliderInputRef}
          min={0}
          max={maxLeverageRatio}
          onChangeCommitted={(newLeverageRatio) =>
            updateWithdrawVaultState({ targetLeverageRatio: newLeverageRatio })
          }
          infoMsg={sliderInfoMessage}
          inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW_VAULT]['leverageInputLabel']}
        />
      )}
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
    </VaultSideDrawer>
  );
};
