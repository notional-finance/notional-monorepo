import {
  TradePropertiesGrid,
  WalletDepositInput,
} from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { SliderInput, SliderInputHandle } from '@notional-finance/mui';
import { useDeleverageVault } from './use-deleverage-vault';
import { Box } from '@mui/material';
import { messages } from '../messages';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useCallback, useEffect, useRef } from 'react';

export const DeleverageVault = () => {
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const vaultAddress = searchParams.get('vaultAddress') || '';
  const action = searchParams.get('action') as VAULT_ACTIONS;
  const history = useHistory();
  const inputRef = useRef<SliderInputHandle>(null);
  const setInputAmount = useCallback(
    (input: number) => {
      inputRef.current?.setInputOverride(input);
    },
    [inputRef]
  );

  const {
    canSubmit,
    transactionData,
    sideDrawerInfo,
    sliderError,
    sliderInfo,
    depositError,
    maxLeverageRatio,
    targetLeverageRatio,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateDeleverageVaultState,
  } = useDeleverageVault(vaultAddress, action);

  useEffect(() => {
    if (targetLeverageRatio) {
      setInputAmount(targetLeverageRatio / RATE_PRECISION);
    }
  }, [targetLeverageRatio, setInputAmount]);

  return (
    <VaultSideDrawer
      action={action}
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={vaultAddress}
      updatedVaultAccount={updatedVaultAccount}
      advancedToggle={{
        label: <FormattedMessage {...messages[action]['toggle']} />,
        onToggle: (isChecked) => {
          const searchParams = new URLSearchParams(search);
          searchParams.set(
            'action',
            isChecked
              ? VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT
              : VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT
          );
        },
        isChecked: action === VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT,
      }}
    >
      {action === VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT && (
        <Box>
          {/* This will reflect the leverage ratio after the deleverage set
              automatically to 10% below the max leverage ratio. Users can reduce
              it further to sell more vault shares. At a low enough leverage ratio
              the vault will withdraw remaining assets to the user's wallet
          */}
          <SliderInput
            ref={inputRef}
            min={0}
            max={maxLeverageRatio / RATE_PRECISION}
            onChangeCommitted={(newLeverageRatio) =>
              updateDeleverageVaultState({
                targetLeverageRatio: Math.floor(
                  newLeverageRatio * RATE_PRECISION
                ),
              })
            }
            errorMsg={sliderError}
            infoMsg={sliderInfo}
            inputLabel={
              messages[VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT]['inputLabel']
            }
          />
        </Box>
      )}
      {action === VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT &&
        primaryBorrowSymbol &&
        targetLeverageRatio && (
          <Box>
            <WalletDepositInput
              availableTokens={[primaryBorrowSymbol]}
              selectedToken={primaryBorrowSymbol}
              onChange={({ inputAmount, hasError }) => {
                updateDeleverageVaultState({
                  depositAmount: inputAmount,
                  hasError,
                });
              }}
              inputLabel={
                messages[VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT]['inputLabel']
              }
              errorMsgOverride={depositError}
            />
          </Box>
        )}
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
    </VaultSideDrawer>
  );
};
