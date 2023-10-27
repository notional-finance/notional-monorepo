import { useTradeContext } from '@notional-finance/notionable-hooks';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { AssetInput, EnablePrimeBorrow } from '@notional-finance/trade';
import { useCurrencyInputRef, SideBarSubHeader } from '@notional-finance/mui';
import { messages } from './messages';
import { defineMessage } from 'react-intl';
import { SelectConvertAsset } from './components/select-convert-asset';
import { useTheme } from '@mui/material';

export const RollDebt = () => {
  const theme = useTheme();
  const context = useTradeContext('RollDebt');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { debt },
    updateState,
  } = context;

  return debt === undefined ? (
    <SelectConvertAsset context={context} />
  ) : (
    <PortfolioSideDrawer context={context}>
      <SideBarSubHeader
        callback={() => updateState({ debt: undefined })}
        sx={{
          position: 'absolute',
          top: 0,
          background: theme.palette.background.paper,
        }}
        titleText={defineMessage({ defaultMessage: 'Back' })}
      ></SideBarSubHeader>
      <AssetInput
        ref={currencyInputRef}
        prefillMax
        debtOrCollateral="Collateral"
        context={context}
        inputRef={currencyInputRef}
        inputLabel={messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['inputLabel']}
      />
      {debt.tokenType === 'PrimeDebt' && <EnablePrimeBorrow />}
    </PortfolioSideDrawer>
  );
};
