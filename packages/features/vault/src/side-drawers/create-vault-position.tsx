import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Maturities,
  PageLoading,
  SliderInput,
  LabelValue,
  CountUp,
  useSliderInputRef,
} from '@notional-finance/mui';
import { Box, styled, useTheme } from '@mui/material';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { useVault } from '@notional-finance/notionable-hooks';
import { MobileVaultSummary } from '../components';
import { useVaultActionErrors } from '../hooks';
import { WalletDepositInput } from '@notional-finance/trade';
import { messages } from '../messages';
import { DebtAmountCaption, TransactionCostCaption } from '../components';
import { useTransactionProperties } from '../hooks/use-transaction-properties';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const CreateVaultPosition = () => {
  const theme = useTheme();
  const { vaultAddress } = useParams<VaultParams>();
  const transactionData = useTransactionProperties();
  const { setSliderInput, sliderInputRef } = useSliderInputRef();
  const { minBorrowSize, maxLeverageRatio, primaryBorrowSymbol } =
    useVault(vaultAddress);
  const { underMinAccountBorrow, inputErrorMsg, leverageRatioError } =
    useVaultActionErrors();
  const {
    updateState,
    state: {
      selectedMarketKey,
      borrowMarketData,
      fCashBorrowAmount,
      leverageRatio,
    },
  } = useContext(VaultActionContext);

  useEffect(() => {
    updateState({
      vaultAction: VAULT_ACTIONS.CREATE_VAULT_POSITION,
    });
  }, [updateState]);

  useEffect(() => {
    if (leverageRatio) setSliderInput(leverageRatio / RATE_PRECISION);
  }, [leverageRatio, setSliderInput]);

  if (!primaryBorrowSymbol) return <PageLoading />;

  const borrowAmount = (
    <LabelValue inline error={underMinAccountBorrow}>
      <CountUp
        value={fCashBorrowAmount?.abs().toFloat() || 0}
        suffix={` ${primaryBorrowSymbol}`}
        decimals={3}
      />
    </LabelValue>
  );

  return (
    <>
      <SummaryWrapper>
        <MobileVaultSummary />
      </SummaryWrapper>
      <Box
        sx={{
          marginTop: {
            xs: theme.spacing(22),
            sm: theme.spacing(22),
            md: '0px',
          },
        }}
      >
        <VaultSideDrawer transactionData={transactionData}>
          <Maturities
            maturityData={borrowMarketData || []}
            onSelect={(marketKey: string | null) => {
              updateState({ selectedMarketKey: marketKey || '' });
            }}
            currentMarketKey={selectedMarketKey || ''}
            inputLabel={messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].maturity}
          />
          <WalletDepositInput
            availableTokens={[primaryBorrowSymbol]}
            selectedToken={primaryBorrowSymbol}
            onChange={({ inputAmount, hasError }) => {
              updateState({ depositAmount: inputAmount, hasError });
            }}
            inputLabel={
              messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].depositAmount
            }
            errorMsgOverride={inputErrorMsg}
          />
          <SliderInput
            ref={sliderInputRef}
            min={0}
            max={maxLeverageRatio / RATE_PRECISION}
            onChangeCommitted={(leverageRatio) =>
              updateState({
                leverageRatio: Math.floor(leverageRatio * RATE_PRECISION),
              })
            }
            errorMsg={
              leverageRatioError ||
              (underMinAccountBorrow
                ? Object.assign(messages.error.underMinBorrow, {
                    values: { minBorrowSize, borrowAmount },
                  })
                : undefined)
            }
            rightCaption={
              <DebtAmountCaption
                borrowAmount={cashBorrowed}
                suffix={primaryBorrowSymbol}
              />
            }
            bottomCaption={
              <TransactionCostCaption
                toolTipText={messages.summary.transactionCostToolTip}
                transactionCost={transactionCost}
                suffix={primaryBorrowSymbol}
              />
            }
            inputLabel={messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].leverage}
          />
        </VaultSideDrawer>
      </Box>
    </>
  );
};

const SummaryWrapper = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    display: block;
    position: fixed;
    top: ${theme.spacing(8.75)};
    left: 0;
    min-width: 100vw;
    z-index: 1;
  }
`
);
