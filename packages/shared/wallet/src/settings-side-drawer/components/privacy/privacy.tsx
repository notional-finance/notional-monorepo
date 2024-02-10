import { useState } from 'react';
import { Box, styled } from '@mui/material';
import { H4, ToggleSwitch } from '@notional-finance/mui';
import { Link } from 'react-router-dom';
import {
  getFromLocalStorage,
  setInLocalStorage,
} from '@notional-finance/helpers';
import { Title } from '../../settings-side-drawer';
import { FormattedMessage } from 'react-intl';

export const Privacy = () => {
  const { disableErrorReporting } = getFromLocalStorage('privacySettings');
  // NOTE* The Plausible API requires plausible_ignore to be at the local storage root level and to be snake case
  const plausibleIgnore = getFromLocalStorage('plausible_ignore');

  const disableTrackingDefault =
    typeof plausibleIgnore !== 'boolean' ? false : plausibleIgnore;

  const [disableDataDogReporting, setDisableDataDogReporting] = useState<
    boolean | undefined
  >(disableErrorReporting);

  const [disableTracking, setDisableTracking] = useState<boolean>(
    disableTrackingDefault
  );

  const handleReportingChange = () => {
    setInLocalStorage('privacySettings', {
      disableErrorReporting: !disableDataDogReporting,
    });
    setDisableDataDogReporting(!disableDataDogReporting);
  };

  const handleTrackingChange = () => {
    setInLocalStorage('plausible_ignore', !disableTracking);
    setDisableTracking(!disableTracking);
  };

  return (
    <WalletSelectorContainer>
      <Title>
        <FormattedMessage defaultMessage="Privacy" />
      </Title>
      <OptionContainer>
        <H4>
          <FormattedMessage defaultMessage={'Disable Behaviour Tracking'} />
        </H4>
        <ToggleSwitch
          isChecked={disableTracking || false}
          onToggle={handleTrackingChange}
        />
      </OptionContainer>
      <OptionContainer>
        <H4>
          <FormattedMessage defaultMessage={'Disable Error Reporting'} />
        </H4>
        <ToggleSwitch
          isChecked={disableDataDogReporting || false}
          onToggle={handleReportingChange}
        />
      </OptionContainer>
      <OptionContainer>
        <Link to="/privacy">
          <CustomLink>
            <FormattedMessage defaultMessage={'Privacy Policy'} />
          </CustomLink>
        </Link>
      </OptionContainer>
    </WalletSelectorContainer>
  );
};

const CustomLink = styled(H4)(
  ({ theme }) => `
  color: ${theme.palette.typography.accent};
  text-decoration: underline;
  `
);

const OptionContainer = styled(Box)(
  ({ theme }) => `
  height: ${theme.spacing(10)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: ${theme.shape.borderStandard};
  padding: ${theme.spacing(2.5, 0)};
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

export default Privacy;
