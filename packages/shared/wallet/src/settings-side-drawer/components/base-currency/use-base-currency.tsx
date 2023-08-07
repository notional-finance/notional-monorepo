import { styled, Box } from '@mui/material';
import {
  JpyIcon,
  UsdIcon,
  CadIcon,
  EurIcon,
  ChfIcon,
  GbpIcon,
} from '@notional-finance/icons';
import { FIAT_NAMES } from '@notional-finance/core-entities/src/config/fiat-config';

export const useBaseCurrency = () => {
  const imgObj = {
    usd: UsdIcon,
    cad: CadIcon,
    eur: EurIcon,
    jpy: JpyIcon,
    chf: ChfIcon,
    gbp: GbpIcon,
  };
  const currencyOptions = FIAT_NAMES.map((name) => {
    const TestIcon = imgObj[name.toLocaleLowerCase()];

    const Icon = (
      <ImageWrapper>
        <TestIcon />
      </ImageWrapper>
    );

    return {
      label: name,
      key: name,
      Icon: Icon,
    };
  });
  return currencyOptions.filter(
    ({ label }) => imgObj[label.toLocaleLowerCase()] !== undefined
  );
};

const ImageWrapper = styled(Box)(
  ({ theme }) => `
    svg {
      fill: ${theme.palette.typography.main};
      height: ${theme.spacing(6)};
      width: ${theme.spacing(6)};
    }
  `
);

export default useBaseCurrency;
