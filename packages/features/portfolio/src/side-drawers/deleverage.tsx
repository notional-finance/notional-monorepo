import { useCurrencyInputRef, HeadingSubtitle } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { AssetInput } from '@notional-finance/trade';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { defineMessage } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { useDeleverageLabels } from './hooks/use-deleverage-labels';
import { useState } from 'react';

export const Deleverage = () => {
  const theme = useTheme();
  const context = useTradeContext('Deleverage');
  // This defines which input field is "controlling" the other
  const [primaryInput, setPrimaryInput] = useState<'Debt' | 'Collateral'>(
    'Collateral'
  );
  const {
    // setCurrencyInput: setDebtInput,
    currencyInputRef: debtInputRef,
  } = useCurrencyInputRef();
  const {
    //setCurrencyInput: setCollateralInput,
    currencyInputRef: collateralInputRef,
  } = useCurrencyInputRef();
  const { debtInputLabel, collateralInputLabel } = useDeleverageLabels(context);

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
            ref={debtInputRef}
            context={context}
            inputRef={debtInputRef}
            deleverage={{
              isPrimaryInput: primaryInput === 'Collateral',
              setPrimaryInput,
            }}
            // NOTE: this actually refers to debt to repay but internally
            // it is referred to as collateral since it will be decreasing
            debtOrCollateral="Collateral"
            label={debtInputLabel}
          />
          <AssetInput
            ref={collateralInputRef}
            context={context}
            inputRef={collateralInputRef}
            deleverage={{
              isPrimaryInput: primaryInput === 'Debt',
              setPrimaryInput,
            }}
            // NOTE: this actually refers to collateral
            debtOrCollateral="Debt"
            label={collateralInputLabel}
          />
        </Box>
      </Box>
    </PortfolioSideDrawer>
  );
};
