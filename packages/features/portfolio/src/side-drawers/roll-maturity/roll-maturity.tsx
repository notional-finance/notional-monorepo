import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import { Box, useTheme } from '@mui/material';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef, SideBarSubHeader } from '@notional-finance/mui';
import { LendBorrowInput } from '@notional-finance/trade';
import { useRollMaturity } from './use-roll-maturity';
import { SetStateAction, useEffect, Dispatch } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';

interface RollMaturityProps {
  setShowRollMaturity: Dispatch<SetStateAction<boolean>>;
}

export const RollMaturity = ({ setShowRollMaturity }: RollMaturityProps) => {
  const theme = useTheme();
  const {
    assetKey,
    marketKey,
    partialRoll: partialRollParam,
  } = useQueryParams();
  const {
    updatedAccountData,
    transactionData,
    canSubmit,
    selectedToken,
    lendOrBorrow,
    selectedMarketKey,
    partialRoll,
    updateRollMaturityState,
  } = useRollMaturity(assetKey);
  const { currencyInputRef } = useCurrencyInputRef();
  const { pathname } = useLocation();
  const history = useHistory();
  useEffect(() => {
    updateRollMaturityState({ selectedMarketKey: marketKey });
  }, [marketKey, updateRollMaturityState]);

  useEffect(() => {
    updateRollMaturityState({ partialRoll: partialRollParam === 'true' });
  }, [partialRollParam, updateRollMaturityState]);

  const handleClose = () => {
    setShowRollMaturity(false);
    history.push({
      pathname: pathname,
      search: '',
    });
  };

  return (
    <Box
      sx={{ background: theme.palette.background.paper, marginTop: '-89px' }}
    >
      <SideBarSubHeader
        callback={handleClose}
        titleText={defineMessage({ defaultMessage: 'back' })}
      />
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
        {/* <Maturities
          maturityData={maturityData}
          selectedfCashId={selectedMarketKey}
          onSelect={(newMarketKey) => {
            updateRollMaturityState({ selectedMarketKey: newMarketKey || '' });
          }}
          inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_MATURITY]['inputLabel']}
        /> */}
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
    </Box>
  );
};
