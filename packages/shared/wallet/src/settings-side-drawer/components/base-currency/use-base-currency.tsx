import { useTheme, styled, Box } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import {
  JpyIcon,
  UsdIcon,
  CadIcon,
  EurIcon,
  ChfIcon,
  GbpIcon,
  KrwIcon,
  CnyIcon,
  BrlIcon,
  NoteIcon,
  EthIcon,
  SgdIcon,
  TryIcon,
} from '@notional-finance/icons';
import { useUserSettings } from '@notional-finance/notionable-hooks';
import { FIAT_NAMES } from '@notional-finance/core-entities';

interface ImageWrapperProps {
  active: boolean;
  theme: NotionalTheme;
}

export const useBaseCurrency = () => {
  const theme = useTheme();
  const { baseCurrency } = useUserSettings();
  const imgObj = {
    usd: UsdIcon,
    cad: CadIcon,
    eur: EurIcon,
    jpy: JpyIcon,
    chf: ChfIcon,
    gbp: GbpIcon,
    krw: KrwIcon,
    cny: CnyIcon,
    brl: BrlIcon,
    note: NoteIcon,
    eth: EthIcon,
    sgd: SgdIcon,
    try: TryIcon,
  };
  const allCurrencies = FIAT_NAMES.map((name) => {
    const BaseCurrencyIcon = imgObj[name.toLocaleLowerCase()];
    return {
      label: name,
      key: name,
      Icon: (
        <ImageWrapper theme={theme} active={baseCurrency === name}>
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

const ImageWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: ImageWrapperProps) => `
    display: flex;
    svg {
      fill: ${
        active ? theme.palette.typography.accent : theme.palette.primary.dark
      };
      height: ${theme.spacing(6)};
      width: ${theme.spacing(6)};
    }
  `
);

export default useBaseCurrency;
