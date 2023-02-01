import { TradePropertiesGrid } from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { SliderInput, SliderInputHandle } from '@notional-finance/mui';
import { useDeleverageVault } from './use-roll-maturity';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { messages } from '../messages';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useCallback, useEffect, useRef } from 'react';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const RollMaturity = () => {
  const { vaultAddress, sideDrawerKey } = useParams<VaultParams>();
  const action = sideDrawerKey || VAULT_ACTIONS.DEPOSIT_COLLATERAL;
  // const { search, pathname } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const vaultAddress = searchParams.get('vaultAddress') || '';
  // const action = searchParams.get('action') as VAULT_ACTIONS;
  // const history = useHistory();
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
    maxLeverageRatio,
    targetLeverageRatio,
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
    >
      <Box>
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
          inputLabel={messages[VAULT_ACTIONS.ROLL_POSITION]['inputLabel']}
        />
      </Box>
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
    </VaultSideDrawer>
  );
};
