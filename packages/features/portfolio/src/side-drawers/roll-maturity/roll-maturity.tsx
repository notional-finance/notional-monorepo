import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { Maturities, useCurrencyInputRef } from '@notional-finance/mui';
import { LendBorrowInput } from '@notional-finance/trade';
import { useRollMaturity } from './use-roll-maturity';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';

export const RollMaturity = () => {
  const {
    assetKey,
    marketKey,
    partialRoll: partialRollParam,
  } = useQueryParams();
  const {
    updatedAccountData,
    transactionData,
    canSubmit,
    maturityData,
    selectedToken,
    lendOrBorrow,
    selectedMarketKey,
    partialRoll,
    updateRollMaturityState,
  } = useRollMaturity(assetKey);
  const { currencyInputRef } = useCurrencyInputRef()

  useEffect(() => {
    updateRollMaturityState({ selectedMarketKey: marketKey });
  }, [marketKey, updateRollMaturityState]);

  useEffect(() => {
    updateRollMaturityState({ partialRoll: partialRollParam === 'true' });
  }, [partialRollParam, updateRollMaturityState]);

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.ROLL_MATURITY}
      canSubmit={canSubmit}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
      advancedToggle={{
        label: (
          <FormattedMessage
            {...messages[PORTFOLIO_ACTIONS.ROLL_MATURITY]['partialRoll']}
          />
        ),
        onToggle: (isChecked) => {
          updateRollMaturityState({ partialRoll: isChecked });
        },
        isChecked: partialRoll,
      }}
    >
      <Maturities
        maturityData={maturityData}
        currentMarketKey={selectedMarketKey}
        onSelect={(newMarketKey) => {
          updateRollMaturityState({ selectedMarketKey: newMarketKey || '' });
        }}
        inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_MATURITY]['inputLabel']}
      />
      {partialRoll && selectedToken && (
        <LendBorrowInput
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          availableTokens={[selectedToken]}
          selectedToken={selectedToken}
          cashOrfCash={'fCash'}
          lendOrBorrow={lendOrBorrow}
          isRemoveAsset={true}
          selectedMarketKey={selectedMarketKey}
          selectedAssetKey={assetKey}
          onChange={({ inputAmount, hasError }) => {
            updateRollMaturityState({ inputAmount, hasError });
          }}
          inputLabel={
            messages[PORTFOLIO_ACTIONS.ROLL_MATURITY]['partialRollInputLabel']
          }
        />
      )}
    </PortfolioSideDrawer>
  );
};
