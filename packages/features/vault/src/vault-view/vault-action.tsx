import { useCallback, useContext, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import {
  Maturities,
  PageLoading,
  SliderInput,
  ActionSidebar,
  TabToggle,
  Button,
  LabelValue,
  CountUp,
  SliderInputHandle,
} from '@notional-finance/mui';
import { TradeActionButton, WalletDepositInput } from '@notional-finance/trade';
import { VaultRiskTable } from '@notional-finance/risk';
import { VAULT_ACTIONS } from '@notional-finance/utils';
import { FormattedMessage } from 'react-intl';
import { useVaultActionErrors } from '../hooks/use-vault-action-errors';
import { messages } from '../messages';
import { VaultActionContext } from '../managers';
import { useVault } from '@notional-finance/notionable-hooks';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { WriteCongress } from '../components/write-congress';
import { useGeoipBlock } from '../hooks/use-geoip-block';

export const VaultAction = () => {
  const { updateState, state } = useContext(VaultActionContext);
  const mustBlockGeo = useGeoipBlock();
  const sliderInputRef = useRef<SliderInputHandle>(null);
  const isInputRefDefined = !!sliderInputRef.current;
  const setSliderInput = useCallback(
    (input: number) => {
      sliderInputRef.current?.setInputOverride(input);
    },
    // isInputRefDefined must be in the dependencies otherwise the useCallback will not
    // properly trigger to generate a new function when the input ref becomes defined
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sliderInputRef, isInputRefDefined]
  );

  const {
    eligibleActions,
    noEligibleMarketsReason,
    vaultAddress,
    selectedMarketKey,
    vaultMaturityData,
    vaultAction,
    updatedVaultAccount,
    vaultAccountMaturityString,
    leverageRatio,
    fCashBorrowAmount,
  } = state;
  const { underMinAccountBorrow, inputErrorMsg, leverageRatioError, canSubmit } =
    useVaultActionErrors();
  const { minBorrowSize, minDepositRequired, maxLeverageRatio, primaryBorrowSymbol } =
    useVault(vaultAddress);

  useEffect(() => {
    if (leverageRatio) setSliderInput(leverageRatio / RATE_PRECISION);
  }, [leverageRatio, setSliderInput]);

  if (!primaryBorrowSymbol || !vaultAction) return <PageLoading />;

  if (noEligibleMarketsReason) {
    return (
      <ActionSidebar heading={messages.error.noEligibleMarkets} helptext={noEligibleMarketsReason}>
        <Button variant="outlined" color="primary" sx={{ width: '100%' }} to="/portfolio/vaults">
          <FormattedMessage {...messages.error.returnToPortfolio} />
        </Button>
      </ActionSidebar>
    );
  }

  const msg = messages[vaultAction];
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
    <ActionSidebar
      heading={Object.assign(msg.heading, {
        values: {
          maturity: (
            // Break the line before the maturity string so it fits
            <>
              <br />
              {vaultAccountMaturityString}
            </>
          ),
        },
      })}
      helptext={
        mustBlockGeo
          ? messages.error.blockedGeoActionHelptext
          : Object.assign(msg.helptext, { values: { minDepositRequired, minBorrowSize } })
      }
      CustomActionButton={mustBlockGeo ? WriteCongress : TradeActionButton}
      canSubmit={canSubmit}
    >
      {eligibleActions &&
        eligibleActions.length > 1 &&
        vaultAction !== VAULT_ACTIONS.ESTABLISH_ACCOUNT && (
          <TabToggle
            selectedTabIndex={vaultAction === VAULT_ACTIONS.INCREASE_POSITION ? 0 : 1}
            tabLabels={[
              <FormattedMessage {...messages[VAULT_ACTIONS.INCREASE_POSITION].tabLabel} />,
              <FormattedMessage {...messages[VAULT_ACTIONS.ROLL_POSITION].tabLabel} />,
            ]}
            // Just use the toggle for styling so show empty boxes here
            tabPanels={[<Box />, <Box />]}
            onChange={(_, value) => {
              updateState({
                vaultAction:
                  value === 0 ? VAULT_ACTIONS.INCREASE_POSITION : VAULT_ACTIONS.ROLL_POSITION,
              });
            }}
          />
        )}
      <Maturities
        maturityData={vaultMaturityData || []}
        onSelect={(marketKey: string | null) => {
          // When increasing positions, the user is not allowed to select a new
          // market so we maintain the selected market key
          if (vaultAction !== VAULT_ACTIONS.INCREASE_POSITION) {
            updateState({ selectedMarketKey: marketKey || '' });
          }
        }}
        currentMarketKey={selectedMarketKey || ''}
        inputLabel={msg.maturity}
      />
      <WalletDepositInput
        availableTokens={[primaryBorrowSymbol]}
        selectedToken={primaryBorrowSymbol}
        onChange={({ inputAmount, hasError }) => {
          updateState({ depositAmount: inputAmount, hasError });
        }}
        inputLabel={msg.depositAmount}
        errorMsgOverride={inputErrorMsg}
      />
      <SliderInput
        ref={sliderInputRef}
        min={0}
        max={maxLeverageRatio / RATE_PRECISION}
        onChangeCommitted={(leverageRatio) =>
          updateState({ leverageRatio: Math.floor(leverageRatio * RATE_PRECISION) })
        }
        errorMsg={
          leverageRatioError ||
          (underMinAccountBorrow
            ? Object.assign(messages.error.underMinBorrow, {
                values: { minBorrowSize, borrowAmount },
              })
            : undefined)
        }
        infoMsg={Object.assign(messages.summary.borrowAmount, {
          values: { borrowAmount },
        })}
        inputLabel={msg.leverage}
      />
      {vaultAddress && (
        <VaultRiskTable vaultAddress={vaultAddress} updatedVaultAccount={updatedVaultAccount} />
      )}
    </ActionSidebar>
  );
};

export default VaultAction;
