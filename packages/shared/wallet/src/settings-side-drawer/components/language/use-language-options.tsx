import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import {
  InternationalIcon,
  ChineseFlagIcon,
  JapaneseFlagIcon,
} from '@notional-finance/icons';
import { LOCALES } from '@notional-finance/shared-config';

export const useLanguageOptions = () => {
  const theme = useTheme();
  return [
    {
      label: <FormattedMessage defaultMessage={'English'} />,
      key: LOCALES.EN_US,
      Icon: (
        <InternationalIcon
          sx={{ height: theme.spacing(6), width: theme.spacing(6) }}
        />
      ),
    },
    {
      label: <FormattedMessage defaultMessage={'Chinese (Simplified)'} />,
      key: LOCALES.ZH_CN,
      Icon: (
        <ChineseFlagIcon
          sx={{ height: theme.spacing(6), width: theme.spacing(6) }}
        />
      ),
    },
    {
      label: <FormattedMessage defaultMessage={'Japanese'} />,
      key: LOCALES.JA,
      Icon: (
        <JapaneseFlagIcon
          sx={{ height: theme.spacing(6), width: theme.spacing(6) }}
        />
      ),
    },
  ];
};

export default useLanguageOptions;
