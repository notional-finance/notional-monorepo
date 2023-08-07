import { styled, Box } from '@mui/material';
import {
  JpyIcon,
  UsdIcon,
  CadIcon,
  EurIcon,
  ChfIcon,
  GbpIcon,
} from '@notional-finance/icons';
import { useFiat } from '@notional-finance/notionable-hooks';
import { FIAT_NAMES } from '@notional-finance/core-entities/src/config/fiat-config';

export const useBaseCurrency = () => {
  const baseCurrency = useFiat();
  const imgObj = {
    usd: UsdIcon,
    cad: CadIcon,
    eur: EurIcon,
    jpy: JpyIcon,
    chf: ChfIcon,
    gbp: GbpIcon,
  };
  const allCurrencies = FIAT_NAMES.map((name) => {
    const BaseCurrencyIcon = imgObj[name.toLocaleLowerCase()];
    return {
      label: name,
      key: name,
      Icon: (
        <ImageWrapper>
          {BaseCurrencyIcon && (
            <BaseCurrencyIcon className="base-currency-icon" />
          )}
        </ImageWrapper>
      ),
    };
  }).filter(({ label }) => imgObj[label.toLocaleLowerCase()] !== undefined);

  const selectedCurrency = allCurrencies.find(
    ({ label }) => label === baseCurrency
  );

  return { allCurrencies, selectedCurrency };
};

const ImageWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
    svg {
      fill: ${theme.palette.typography.main};
      height: ${theme.spacing(6)};
      width: ${theme.spacing(6)};
    }
  `
);

export default useBaseCurrency;
