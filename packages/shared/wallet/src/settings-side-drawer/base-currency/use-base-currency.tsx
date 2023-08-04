// import { FormattedMessage } from 'react-intl';
// import { useTheme } from '@mui/material';
import { FIAT_NAMES } from '@notional-finance/core-entities/src/config/fiat-config';

export const useLanguageOptions = () => {
  // const theme = useTheme();
  const test = FIAT_NAMES.map((name) => {
    return {
      label: name,
      key: name,
    };
  });
  console.log({ test });
};

export default useLanguageOptions;
