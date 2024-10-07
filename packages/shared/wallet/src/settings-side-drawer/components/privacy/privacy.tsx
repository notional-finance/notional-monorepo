import { useEffect, useState } from 'react';
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
  const [disableErrorReporting, setDisableErrorReporting] =
    useState<boolean>(false);

  const [disableTracking, setDisableTracking] = useState<boolean>(false);

  useEffect(() => {
    const settings = getFromLocalStorage('privacySettings');

    if (settings['disableErrorReporting']) {
      setDisableErrorReporting(settings['disableErrorReporting']);
    }
    if (settings['disableTracking']) {
      setDisableTracking(settings['disableTracking']);
    }
  }, []);

  const handleReportingChange = () => {
    setDisableErrorReporting(!disableErrorReporting);
    setInLocalStorage('privacySettings', {
      disableErrorReporting,
      disableTracking,
    });
  };

  const handleTrackingChange = () => {
    setDisableTracking(!disableTracking);
    setInLocalStorage('privacySettings', {
      disableErrorReporting,
      disableTracking,
    });
  };

  return (
    <WalletSelectorContainer>
      <Title>
        <FormattedMessage defaultMessage="Privacy" />
      </Title>
      <OptionContainer>
        <H4>
          <FormattedMessage defaultMessage={'Disable Behavior Tracking'} />
        </H4>
        <ToggleSwitch
          isChecked={disableTracking}
          onToggle={handleTrackingChange}
        />
      </OptionContainer>
      <OptionContainer>
        <H4>
          <FormattedMessage defaultMessage={'Disable Error Reporting'} />
        </H4>
        <ToggleSwitch
          isChecked={disableErrorReporting}
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
