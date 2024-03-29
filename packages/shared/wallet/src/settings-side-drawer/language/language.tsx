import { Box, styled, useTheme } from '@mui/material';
import { H4, LabelValue } from '@notional-finance/mui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { LOCALES } from '@notional-finance/shared-config';
import {
  CircleIcon,
  InternationalIcon,
  ChineseFlagIcon,
  JapaneseFlagIcon,
} from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { messages } from './messages';

const languageOptions = [
  {
    label: <FormattedMessage defaultMessage={'English'} />,
    key: LOCALES.EN_US,
    Icon: InternationalIcon,
  },
  {
    label: <FormattedMessage defaultMessage={'Chinese (Simplified)'} />,
    key: LOCALES.ZH_CN,
    Icon: ChineseFlagIcon,
  },
  {
    label: <FormattedMessage defaultMessage={'Japanese'} />,
    key: LOCALES.JA,
    Icon: JapaneseFlagIcon,
  },
];

export const LanguageButton = () => {
  const theme = useTheme();
  const { language } = getFromLocalStorage('userSettings');
  const savedLanguage = language ? language : navigator.language;
  const langData = languageOptions.find((data) => data.key === savedLanguage);

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={{ paddingRight: theme.spacing(1), display: 'flex' }}>
        {langData?.Icon && (
          <langData.Icon sx={{ height: theme.spacing(2.5) }} />
        )}
      </Box>

      <FormattedMessage {...messages[savedLanguage]} />
    </Box>
  );
};

export const Language = () => {
  const theme = useTheme();
  const userSettings = getFromLocalStorage('userSettings');
  const defaultValue = userSettings?.language
    ? userSettings.language
    : navigator.language;

  const handleConnect = (key: string) => {
    setInLocalStorage('userSettings', { ...userSettings, language: key });
    window.location.reload();
  };

  return (
    <WalletSelectorContainer>
      <Title>
        <FormattedMessage defaultMessage="Language" />
      </Title>
      {languageOptions.map(({ label, Icon, key }, index) => (
        <WalletButton
          onClick={() => handleConnect(key)}
          key={index}
          active={defaultValue === key}
          theme={theme}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ height: theme.spacing(6), width: theme.spacing(6) }} />
          </Box>
          <H4
            sx={{ whiteSpace: 'nowrap', marginLeft: theme.spacing(3) }}
            fontWeight="regular"
          >
            {label}
          </H4>
          <Box
            sx={{
              justifyContent: 'flex-end',
              display: 'flex',
              width: '100%',
            }}
          >
            {defaultValue === key ? (
              <CheckCircleIcon sx={{ fill: theme.palette.primary.main }} />
            ) : (
              <CircleIcon
                sx={{
                  stroke: theme.palette.borders.accentPaper,
                  width: theme.spacing(2.5),
                  height: theme.spacing(2.5),
                }}
              />
            )}
          </Box>
        </WalletButton>
      ))}
    </WalletSelectorContainer>
  );
};

const WalletButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: { active: boolean; theme: NotionalTheme }) => `
  padding: ${theme.spacing(2.5)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    active ? theme.palette.primary.main : theme.palette.borders.paper
  };
  margin: ${theme.spacing(1)} 0px;
  cursor: pointer;
  background: ${active ? theme.palette.info.light : theme.palette.common.white};
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  align-items: center;
  &:hover {
    transition: .5s ease;
    background: ${theme.palette.info.light};
  }
  `
);

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

const WalletSelectorContainer = styled(Box)(
  ({ theme }) => `
  margin: 0px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  background: ${theme.palette.background.paper};
  `
);

export default Language;
