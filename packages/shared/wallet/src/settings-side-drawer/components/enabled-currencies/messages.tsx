import { LOCALES } from '@notional-finance/util';
import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  [LOCALES.EN_US]: {
    defaultMessage: 'English',
    description: 'Language button title',
  },
  [LOCALES.ZH_CN]: {
    defaultMessage: 'Chinese (Simplified)',
    description: 'Language button title',
  },
  [LOCALES.JA]: {
    defaultMessage: 'Japanese',
    description: 'Language button title',
  },
});
