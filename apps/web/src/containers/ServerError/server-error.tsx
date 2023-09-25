import { Box, useTheme } from '@mui/material';
import { defineMessages, FormattedMessage } from 'react-intl';
import ServerErrorImage from '@notional-finance/assets/images/ServerErrorImage.png';
import ServerErrorImageMobile from '@notional-finance/assets/images/ServerErrorImageMobile.png';
import { DiscordButtonGradient } from '@notional-finance/mui';
import { H2, H4 } from '@notional-finance/mui';
import { useQueryParams } from '@notional-finance/notionable-hooks';

const errorMessages = defineMessages({
  '404': {
    defaultMessage: "We can't find the page you're looking for",
    description: 'server error message',
  },
  '451': {
    defaultMessage:
      'Your region is blocked due to US sanctions. See the affected export control list here: https://orpa.princeton.edu/export-controls/sanctioned-countries',
    description: 'server error message',
  },
  '500': {
    defaultMessage: 'Internal system error',
    description: 'server error message',
  },
});

const errorHeader = defineMessages({
  '404': {
    defaultMessage: 'Not Found',
  },
  '451': {
    defaultMessage: 'Unavailable For Legal Reasons',
  },
  '500': {
    defaultMessage: 'Internal System Error',
  },
});

export const ServerError = () => {
  const theme = useTheme();
  const params = useQueryParams();
  const errorCode = params.get('code') || '404';

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.common.black,
        paddingTop: { md: '0px', xs: theme.spacing(12) },
        paddingBottom: { md: '0px', xs: theme.spacing(10) },
        display: 'flex',
        height: 'unset !important',
      }}
    >
      <Box
        sx={{
          maxWidth: theme.spacing(75),
          paddingTop: { md: theme.spacing(38), xs: '0px' },
          paddingBottom: { md: theme.spacing(38), xs: '0px' },
          paddingLeft: { md: theme.spacing(13), xs: '0px' },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <H2
          contrast
          sx={{
            marginBottom: theme.spacing(3),
            marginRight: theme.spacing(3),
          }}
          msg={errorHeader[errorCode] || errorHeader['500']}
        />
        <H4
          contrast
          sx={{ marginBottom: theme.spacing(6) }}
          msg={errorMessages[errorCode] || errorMessages['500']}
        />
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            img: { maxWidth: '100%' },
            marginBottom: theme.spacing(6),
          }}
        >
          <img src={ServerErrorImageMobile} alt="server error" />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          <DiscordButtonGradient
            buttonText={
              <FormattedMessage defaultMessage={'Join Us on Discord'} />
            }
          />
          <H4
            to="/"
            accent
            sx={{
              marginLeft: { xs: '0px', lg: theme.spacing(4) },
              marginTop: { xs: theme.spacing(2), lg: '0px' },
            }}
          >
            <FormattedMessage defaultMessage="Back to Home" />
          </H4>
        </Box>
      </Box>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          marginTop: { md: theme.spacing(15), xs: '0px' },
          marginBottom: { md: theme.spacing(19), xs: '0px' },
        }}
      >
        <img src={ServerErrorImage} alt="server error" />
      </Box>
    </Box>
  );
};
