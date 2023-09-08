import { useTradeContext } from '@notional-finance/notionable-hooks';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { AssetInput } from '@notional-finance/trade';
import { useCurrencyInputRef, SideBarSubHeader } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { messages } from './messages';
import { SelectConvertAsset } from './components/select-convert-asset';
import { useTheme } from '@mui/material';

export const ConvertAsset = () => {
  const theme = useTheme();
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { collateral },
    updateState,
  } = context;

  return collateral === undefined ? (
    <SelectConvertAsset context={context} />
  ) : (
    <PortfolioSideDrawer context={context}>
      <SideBarSubHeader
        callback={() => updateState({ collateral: undefined })}
        sx={{
          position: 'absolute',
          top: 0,
          background: theme.palette.background.paper,
        }}
        titleText={defineMessage({ defaultMessage: 'back' })}
      ></SideBarSubHeader>
      <AssetInput
        ref={currencyInputRef}
        prefillMax
        debtOrCollateral="Debt"
        context={context}
        inputRef={currencyInputRef}
        inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
      />
    </PortfolioSideDrawer>
  );
};
