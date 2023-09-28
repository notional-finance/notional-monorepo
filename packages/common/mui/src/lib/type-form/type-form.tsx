import { useEffect, useState } from 'react';
import { useTheme, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Widget } from '@typeform/embed-react';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { WaveButtonIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';

const FormWrapper = styled(Box)(
  ({ theme }) => `
    position: absolute;
    background-color: ${theme.palette.common.white};
    z-index: 99;
    font-weight: bold;
    text-align: center;
    top: 0;
    margin-left: 140px;
    margin-bottom: 150px;
    margin-top: 280px;
    box-shadow: -2px 1px 24px rgba(20, 41, 102, 0.2), 0px 4px 16px rgba(29, 116, 119, 0.4);
    @media (max-width: 400px) {
      display: none;
    }
    `
);

const StartWrapper = styled(Box)(
  ({ theme }) => `
    color: ${theme.palette.common.white};
    width: 495px;
    height: 370px;
    `
);

const Title = styled(Box)(
  ({ theme }) => `
    color: ${theme.palette.common.black};
    display: block;
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 40px;
    `
);

const DismissText = styled('div')(
  ({ theme }) => `
    color: ${theme.palette.borders.accentPaper};
    font-size: .875rem;
    font-weight: normal;
    text-decoration: underline;
    margin-top: 70px;
    cursor: pointer;
    `
);

const Text = styled('div')(
  ({ theme }) => `
    color: ${theme.palette.common.black};
    font-size: .875rem;
    font-weight: normal;
    margin-bottom: 10px;
    `
);

export const TypeForm = () => {
  const theme = useTheme();
  const [hideOverallForm, setHideOverallForm] = useState<boolean>(true);
  const [showWidget, setShowWidget] = useState<boolean>(false);
  const timeDismissed = getFromLocalStorage('typeForm').timeOfDismissal;

  const handleSubmit = () => {
    setInLocalStorage('typeForm', { formSubmitted: true });
    setHideOverallForm(true);
  };

  const handleDismiss = () => {
    const now = new Date().getTime();
    setInLocalStorage('typeForm', { timeOfDismissal: now });
    setHideOverallForm(true);
  };

  const checkTimestamp = () => {
    const now = new Date().getTime();
    if (timeDismissed && now - timeDismissed > 24 * 60 * 60 * 1000) {
      setInLocalStorage('typeForm', { timeOfDismissal: undefined });
      setHideOverallForm(false);
    }
  };

  useEffect(() => {
    checkTimestamp();
  }, []);

  setTimeout(() => {
    const typeFormSubmitted = getFromLocalStorage('typeForm').formSubmitted;
    const timeDismissed = getFromLocalStorage('typeForm').timeOfDismissal;
    if (!typeFormSubmitted && !timeDismissed) {
      setHideOverallForm(false);
    }
  }, 5000);

  return (
    <FormWrapper>
      {!hideOverallForm && (
        <>
          {showWidget === false && (
            <StartWrapper>
              <WaveButtonIcon></WaveButtonIcon>
              <Title>
                <FormattedMessage
                  defaultMessage={'Give us feedback on our Beta!'}
                />
              </Title>
              <Text>
                <FormattedMessage
                  defaultMessage={'takes less than 2 minutes'}
                />
              </Text>
              <Button
                onClick={() => setShowWidget(true)}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  borderRadius: '0px',
                  padding: '12px 48px',
                  backgroundColor: theme.palette.primary.light,
                }}
              >
                <FormattedMessage defaultMessage={'Start Survey'} />
              </Button>
              <DismissText onClick={handleDismiss}>
                <FormattedMessage defaultMessage={'Do this later'} />
              </DismissText>
            </StartWrapper>
          )}
          {showWidget === true && (
            <Widget
              height={750}
              width={495}
              id="https://eehxwr6nfuc.typeform.com/to/AClgXM23"
              style={{ fontSize: 16, zIndex: 99999 }}
              onSubmit={handleSubmit}
            ></Widget>
          )}
        </>
      )}
    </FormWrapper>
  );
};

export default TypeForm;
