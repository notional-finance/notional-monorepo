import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { AssetInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { messages } from './messages';
import { SelectConvertAsset } from './components/select-convert-asset';

const ConvertAssetContext = createTradeContext('ConvertAsset');

export const ConvertAsset = () => {
  const context = useTradeContext('ConvertAsset');
  const { currencyInputRef } = useCurrencyInputRef();
  const {
    state: { collateral },
  } = context;

  return (
    <ConvertAssetContext.Provider value={context}>
      {collateral === undefined ? (
        <SelectConvertAsset context={ConvertAssetContext} />
      ) : (
        <PortfolioSideDrawer
          action={PORTFOLIO_ACTIONS.CONVERT_ASSET}
          context={ConvertAssetContext}
        >
          <AssetInput
            ref={currencyInputRef}
            prefillMax
            debtOrCollateral="Debt"
            context={ConvertAssetContext}
            inputRef={currencyInputRef}
            inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['inputLabel']}
          />
        </PortfolioSideDrawer>
      )}
    </ConvertAssetContext.Provider>
  );
};
