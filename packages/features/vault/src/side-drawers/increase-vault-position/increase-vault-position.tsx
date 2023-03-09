import { useCallback, useContext, useRef, useEffect } from 'react';
import { WalletDepositInput } from '@notional-finance/trade';
import { Box, useTheme } from '@mui/material';
import {
  SliderInput,
  SliderInputHandle,
  InfoTooltip,
} from '@notional-finance/mui';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useIncreaseVaultPosition } from './use-increase-vault-position';
import { messages } from '../../messages';
import { FormattedMessage, defineMessage } from 'react-intl';

export const IncreaseVaultPosition = () => {
  const {
    updateState,
    state: {
      primaryBorrowSymbol,
      maxLeverageRatio,
      leverageRatio,
      fCashBorrowAmount,
    },
  } = useContext(VaultActionContext);
  const theme = useTheme();

  const inputRef = useRef<SliderInputHandle>(null);

  const sliderError = undefined;
  const sliderInfo = undefined;

  const setInputAmount = useCallback(
    (input: number) => {
      inputRef.current?.setInputOverride(input);
    },
    [inputRef]
  );

  useEffect(() => {
    if (leverageRatio) {
      setInputAmount(leverageRatio / RATE_PRECISION);
    }
  }, [leverageRatio, setInputAmount]);

  const transactionData = useIncreaseVaultPosition();
  const amountBorrowed =
    fCashBorrowAmount?.neg().toDisplayStringWithfCashSymbol() || '0.000';

  return (
    <VaultSideDrawer transactionData={transactionData}>
      {primaryBorrowSymbol && (
        <WalletDepositInput
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount, hasError }) => {
            updateState({
              depositAmount: inputAmount,
              hasError,
            });
          }}
          inputLabel={messages[VAULT_ACTIONS.INCREASE_POSITION]['inputLabel']}
          errorMsgOverride={undefined}
        />
      )}
      <SliderInput
        ref={inputRef}
        min={0}
        max={maxLeverageRatio ? maxLeverageRatio / RATE_PRECISION : 0}
        onChangeCommitted={(newLeverageRatio) =>
          updateState({
            leverageRatio: Math.floor(newLeverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={sliderError}
        infoMsg={sliderInfo}
        inputLabel={messages[VAULT_ACTIONS.INCREASE_POSITION].leverage}
        rightCaption={
          <Box sx={{ display: 'flex' }}>
            <FormattedMessage defaultMessage="Borrow Amount: " />
            <Box sx={{ fontWeight: 'bold', marginLeft: theme.spacing(1) }}>
              {amountBorrowed}
            </Box>
          </Box>
        }
        bottomCaption={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedMessage defaultMessage="Transaction Costs: " />
            <InfoTooltip
              toolTipText={defineMessage({
                defaultMessage: 'TBD',
                description: 'tooltip text',
              })}
              sx={{ fontSize: '14px', marginLeft: theme.spacing(0.5) }}
            />
            <Box sx={{ fontWeight: 'bold', marginLeft: theme.spacing(1) }}>
              0.00
            </Box>
          </Box>
        }
      />
    </VaultSideDrawer>
  );
};
