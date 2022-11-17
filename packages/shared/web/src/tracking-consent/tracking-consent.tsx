import { useEffect } from 'react';
import { styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';
import { Link } from 'react-router-dom';
import { setInLocalStorage } from '@notional-finance/helpers';
import { updateTrackingState } from '@notional-finance/utils';

const StyledLink = styled(Link)(
  ({ theme }) => `
  color: ${theme.palette.primary.accent};
`
);

export function TrackingConsent() {
  const theme = useTheme();
  const onDecline = () => {
    setInLocalStorage('plausible_ignore', true);
  };

  return (
    <CookieConsent
      enableDeclineButton
      location="bottom"
      buttonText={<FormattedMessage defaultMessage={'Ok'} />}
      declineButtonText={<FormattedMessage defaultMessage={'Decline'} />}
      declineButtonStyle={{
        background: theme.palette.borders.accentDefault,
        borderRadius: theme.shape.borderRadius(),
        color: theme.palette.common.black,
      }}
      buttonStyle={{
        background: theme.palette.primary.accent,
        borderRadius: theme.shape.borderRadius(),
      }}
      onDecline={onDecline}
    >
      <span>
        <FormattedMessage
          defaultMessage={'We use anonymized cookies to improve our product.'}
        />
      </span>
      &nbsp;
      <StyledLink to="/privacy">
        <FormattedMessage defaultMessage={'See our Privacy Policy'} />
      </StyledLink>
    </CookieConsent>
  );
}

export default TrackingConsent;
