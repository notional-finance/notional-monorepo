import { useCallback } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { SideDrawerActiveButton } from '@notional-finance/mui';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { Title } from '../../settings-side-drawer';
import { useLanguageOptions } from './use-language-options';
import { messages } from './messages';

export const LanguageButton = () => {
  const theme = useTheme();
  const { language } = getFromLocalStorage('userSettings');
  const savedLanguage = language ? language : navigator.language;
  const languageOptions = useLanguageOptions();
  const langData = languageOptions.find((data) => data.key === savedLanguage);
  const msg = messages[savedLanguage] || messages['en-US'];
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          paddingRight: theme.spacing(1),
          display: 'flex',
          svg: { height: theme.spacing(2.5), width: theme.spacing(2.5) },
        }}
      >
        {langData?.Icon && langData.Icon}
      </Box>

      <FormattedMessage {...msg} />
    </Box>
  );
};

export const Language = () => {
  const userSettings = getFromLocalStorage('userSettings');
  const languageOptions = useLanguageOptions();
  const defaultKey = userSettings?.language
    ? userSettings.language
    : navigator.language;

  const handleConnect = useCallback(
    (key: string) => {
      setInLocalStorage('userSettings', { ...userSettings, language: key });
      window.location.reload();
    },
    [userSettings]
  );

  return (
    <WalletSelectorContainer>
      <Title>
        <FormattedMessage defaultMessage="Language" />
      </Title>
      {languageOptions.map(({ label, Icon, key }, index) => (
        <SideDrawerActiveButton
          label={label}
          Icon={Icon}
          dataKey={key}
          key={index}
          callback={handleConnect}
          selectedKey={defaultKey}
        />
      ))}
    </WalletSelectorContainer>
  );
};

const WalletSelectorContainer = styled(Box)(
  ({ theme }) => `
  margin: 0px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  background: ${theme.palette.background.paper};
  `
);

export default Language;
