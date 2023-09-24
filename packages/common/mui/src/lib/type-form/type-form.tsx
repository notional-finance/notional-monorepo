import { useState } from 'react';
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
    bottom: 0;
    right: 0;
    margin: 40px;
    margin-right: 15px;
    margin-bottom: 150px;
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

  const handleSubmit = () => {
    setInLocalStorage('typeForm', { formSubmitted: true });
    setHideOverallForm(true);
  };

  setTimeout(() => {
    const typeFormSubmitted = getFromLocalStorage('typeForm').formSubmitted;
    if (!typeFormSubmitted) {
      setHideOverallForm(false);
    }
  }, 15000);
  return (
    <FormWrapper>
      {!hideOverallForm && (
        <>
          {showWidget === false && (
            <StartWrapper>
              <WaveButtonIcon></WaveButtonIcon>
              <Title>
                <FormattedMessage
                  defaultMessage={'Help us build a better Notional!'}
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
              <DismissText onClick={handleSubmit}>
                <FormattedMessage
                  defaultMessage={"Dismiss and don't show again"}
                />
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
