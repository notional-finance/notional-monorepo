import {
  useCurrencyInputRef,
  HeadingSubtitle,
} from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { defineMessage } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { useDeleverageLabels } from './hooks/use-deleverage-labels';

export const Deleverage = () => {
  const theme = useTheme();
  const context = useTradeContext('Deleverage');
  const {
    // setCurrencyInput: setDebtInput,
    currencyInputRef: debtInputRef,
  } = useCurrencyInputRef();
  const {
    //setCurrencyInput: setCollateralInput,
    currencyInputRef: collateralInputRef,
  } = useCurrencyInputRef();
  const { debtInputLabel, collateralInputLabel } = useDeleverageLabels(context);

  // TODO: need a new calculation method that calls calculateDebt or calculateCollateral
  // depending on the selected input...

  return (
    <PortfolioSideDrawer context={context}>
      <Box>
        <HeadingSubtitle
          gutter="default"
          msg={defineMessage({
            defaultMessage: 'Specify Debt to Repay and Collateral to Sell',
          })}
        />
        <Box
          sx={{
            padding: theme.spacing(3, 2, 0, 2),
            border: theme.shape.borderStandard,
            borderRadius: theme.shape.borderRadius(),
          }}
        >
          <AssetInput
            context={context}
            inputRef={debtInputRef}
            // NOTE: this actually refers to debt to repay but internally
            // it is referred to as collateral since it will be decreasing
            debtOrCollateral="Collateral"
            label={debtInputLabel}
          />
          <AssetInput
            context={context}
            inputRef={collateralInputRef}
            // NOTE: this actually refers to collateral
            debtOrCollateral="Debt"
            label={collateralInputLabel}
          />
        </Box>
      </Box>
    </PortfolioSideDrawer>
  );
};
