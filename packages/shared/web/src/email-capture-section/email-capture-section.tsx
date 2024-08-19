import { ChangeEvent, useState } from 'react';
import { styled, useTheme, Box } from '@mui/material';
import axios from 'axios';
import { FormattedMessage } from 'react-intl';
import { H2 } from '@notional-finance/mui';
import sacredGeometryPNG from './sacred-geometry.png';
import { colors } from '@notional-finance/styles';
import { InputForm } from './input-form';

type SubmitState = 'pending' | 'success' | 'error' | null;

const APIUrl = 'https://api.notional.finance';
export const EmailCaptureSection = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>(null);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onSubmit = () => {
    setSubmitState('pending');
    axios({
      url: `${APIUrl}/newsletter`,
      method: 'post',
      data: `form-name=newsletter&email=${encodeURIComponent(email)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(() => {
        setSubmitState('success');
      })
      .catch(() => {
        setSubmitState('error');
      });
  };

  return (
    <BackgroundContainer>
      <InnerContainer>
        <ContentContainer>
          <H2 sx={{ marginBottom: theme.spacing(6), color: colors.white }}>
            <FormattedMessage
              defaultMessage="Be the first to hear Notional's news and market insights."
              description="email signup heading"
            />
          </H2>
          <InputForm
            submitState={submitState}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            email={email}
          />
        </ContentContainer>
        <ImgContainer>
          <img
            src={sacredGeometryPNG}
            alt="Sacred geometry"
            style={{ width: theme.spacing(34) }}
          />
        </ImgContainer>
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  `
  height: 100%;
  width: 100%; 
  background: linear-gradient(178.57deg, #053542 1.54%, #06657E 99.12%);
  color: ${colors.white};
      `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
  height: 100%;
  margin: auto; 
  width: ${theme.spacing(150)};
  padding-top: ${theme.spacing(15)};
  padding-bottom: ${theme.spacing(15)};
  display: flex;
  ${theme.breakpoints.down('mdLanding')} {
    width: ${theme.spacing(125)}; 
  }
  ${theme.breakpoints.down('smLanding')} {
    width: 90%;
  }
  ${theme.breakpoints.down('sm')} {
    padding-top: ${theme.spacing(7)};
    padding-bottom: ${theme.spacing(7)};
  }
      `
);

const ContentContainer = styled(Box)(
  `
  display: flex;
  flex-direction: column;
  flex: 1;
`
);

const ImgContainer = styled(Box)(
  ({ theme }) => `
  width: 45%;
  display: flex;
  justify-content: end;
  ${theme.breakpoints.down('smLanding')} {
   display: none;
  }
`
);

export default EmailCaptureSection;
