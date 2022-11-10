import { ChangeEvent, useState } from 'react';
import { styled, useTheme } from '@mui/material';
import axios from 'axios';
import { FormattedMessage } from 'react-intl';
import { ProgressIndicator, Button, H1, Label } from '@notional-finance/mui';
import { useInView } from 'react-intersection-observer';
import sacredGeometryPNG from '@notional-finance/assets/images/sacred-geometry.png';
import iconCheckmark from '@notional-finance/assets/icons/icon-checkmark.svg';
import iconAlert from '@notional-finance/assets/icons/icon-alert.svg';

type SubmitState = 'Pending' | 'Success' | 'Error' | null;

export const EmailCaptureSection = () => {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const inViewClassName = inView ? 'fade-in' : 'hidden';
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>(null);
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const onSubmit = () => {
    // dispatch({ type: constants.SUBSCRIBE_EMAIL });
    setSubmitState('Pending');
    axios({
      url: '/',
      method: 'post',
      data: `form-name=newsletter&email=${encodeURIComponent(email)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(() => {
        setSubmitState('Success');
      })
      .catch(() => {
        setSubmitState('Error');
      });
  };

  const getFormState = (state: SubmitState) => {
    switch (state) {
      case 'Pending':
        return (
          <div className="newsletter-input-state">
            <span>
              <ProgressIndicator type="circular" size={24} />
            </span>
          </div>
        );
      case 'Success':
        return (
          <div className="newsletter-input-state">
            <span>
              <img src={iconCheckmark} alt="success" />
              <FormattedMessage
                defaultMessage={'Successfully signed up!'}
                description="email subscription signup"
              />
            </span>
          </div>
        );
      case 'Error':
        return (
          <div className="newsletter-input-state">
            <span>
              <img src={iconAlert} alt="error" />{' '}
              <FormattedMessage defaultMessage="Error" />
            </span>
          </div>
        );
      default:
        return (
          <form name="newsletter" data-netlify="true">
            <input type="hidden" name="form-name" value="newsletter" />
            <div className="newsletter-label">
              <Label contrast fontWeight="medium">
                <FormattedMessage
                  defaultMessage="Your Email"
                  description="email signup"
                />
              </Label>
            </div>
            <span className="newsletter-input">
              <FormattedMessage
                defaultMessage={'Enter Your Email'}
                description="email input form"
              >
                {(msg: unknown) => {
                  return (
                    <input
                      type="email"
                      name="email"
                      placeholder={msg as string}
                      onChange={onInputChange}
                      value={email}
                    />
                  );
                }}
              </FormattedMessage>
              <Button
                onClick={onSubmit}
                sx={{
                  background: theme.palette.info.main,
                  color: theme.palette.typography.main,
                  height: theme.spacing(6),
                  padding: theme.spacing(2, 4),
                }}
              >
                <FormattedMessage
                  defaultMessage="Sign Up Now"
                  description="email signup button"
                />
              </Button>
            </span>
          </form>
        );
    }
  };

  return (
    <StyledEmailCapture ref={ref}>
      <div id="section-9" className={`section ${inViewClassName}`}>
        <div id="section-9-container">
          <div className="left-container">
            <H1 contrast marginBottom={theme.spacing(8)}>
              <FormattedMessage
                defaultMessage="Be the first to hear Notional's news and market insights."
                description="email signup heading"
              />
            </H1>
            {getFormState(submitState)}
          </div>
          <div className="right-container">
            <img src={sacredGeometryPNG} alt="Sacred geometry" />
          </div>
        </div>
      </div>
    </StyledEmailCapture>
  );
};

const StyledEmailCapture = styled('div')(
  ({ theme }) => `
  #section-9 {
    background: linear-gradient(178.57deg, #053542 1.54%, #06657E 99.12%);
    color: ${theme.palette.common.white};

    .newsletter-input-state {
      height: 3rem;
      padding-top: 2rem;

      span {
        display: inline-flex;

        img {
          width: 1.5rem;
          margin-right: 0.5rem;
        }
      }
    }

    .newsletter-label {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .newsletter-input {
      display: flex;
      align-items: center;

      input {
        width: 370px;
        height: 48px;
        border: 1px solid ${theme.palette.primary.light};
        border-radius: 6px;
        margin-right: 1.5rem;
        background-color: transparent;
        // This removes the red required outline in firefox
        box-shadow: none !important;
        color: ${theme.palette.common.white};
        padding-left: 0.5rem;
        box-sizing: border-box;
      }

      input::placeholder {
        color: ${theme.palette.common.white};
        font-size: 1rem;
        font-family: inherit;
        opacity: 1;
      }

      input:focus {
        outline: none;
      }

    }

    .MuiButton-root {
    }

    #section-9-container {
      display: flex;
      padding: 100px 163px;

      .left-container { width: 50%; }

      .right-container {
        margin: 0 auto;

        img { width: 400px; }
      }
    }
  }

  @media (max-width: 1250px) {
    #section-9 {
      .btn {
        width: 130px;
        padding: 15px 5px;
      }

      .newsletter-input {
        flex-direction: column;

        input {
          width: 100%;
          margin-right: 0px;
          margin-bottom: 24px;
        }
      }

      #section-9-container {
        display: block;
        padding: 60px 20px;

        .left-container,
        .right-container {
          width: 100%;
        }

        .right-container {
          img {
            display: none;
          }
        }
      }
    }
  }
`
);

export default EmailCaptureSection;
