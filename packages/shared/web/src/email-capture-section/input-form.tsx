import { styled, useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ProgressIndicator, Button, ButtonText } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { CheckmarkRoundIcon } from '@notional-finance/icons';

export const InputForm = ({ submitState, onInputChange, onSubmit, email }) => {
  const theme = useTheme();

  return (
    <Box>
      {submitState === 'pending' && (
        <ProgressIndicator type="circular" size={32} />
      )}
      {submitState === 'success' && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckmarkRoundIcon
            foregroundColor={colors.white}
            backgroundColor={colors.aqua}
            sx={{ height: theme.spacing(4), marginRight: theme.spacing(2) }}
          />
          <LabelText sx={{ marginBottom: '0px' }}>
            <FormattedMessage
              defaultMessage={'Successfully signed up!'}
              description="email subscription signup"
            />
          </LabelText>
        </Box>
      )}
      {submitState === 'error' && (
        <ButtonText sx={{ color: colors.red }}>
          <FormattedMessage
            defaultMessage="An error has occurred"
            description="email error"
          />
        </ButtonText>
      )}
      {submitState === null && (
        <form name="newsletter" data-netlify="true">
          <LabelText>
            <FormattedMessage
              defaultMessage="Your Email"
              description="email signup"
            />
          </LabelText>
          <InputContainer>
            <FormattedMessage
              defaultMessage={'Enter Your Email'}
              description="email input form"
            >
              {(msg: unknown) => {
                return (
                  <Input
                    type="email"
                    name="email"
                    placeholder={msg as string}
                    onChange={onInputChange}
                    value={email}
                  />
                );
              }}
            </FormattedMessage>
            <Button size="large" onClick={onSubmit} sx={{}}>
              <FormattedMessage
                defaultMessage="Sign Up Now"
                description="email signup button"
              />
            </Button>
          </InputContainer>
        </form>
      )}
    </Box>
  );
};

const LabelText = styled(ButtonText)(
  ({ theme }) => `
    color: ${colors.white};
    text-transform: uppercase;
    margin-bottom: ${theme.spacing(1)};
          `
);

const InputContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
  }
          `
);

const Input = styled('input')(
  ({ theme }) => `
  width: ${theme.spacing(46.25)};
  height: ${theme.spacing(6.75)};
  border: 1px solid ${colors.aqua};
  border-radius: ${theme.shape.borderRadius()};
  margin-right: 1.5rem;
  font-size: 1rem;
  background: linear-gradient(271.53deg, rgba(191, 201, 245, 0.1) -60.81%, rgba(142, 161, 245, 0.1) -60.79%, rgba(38, 203, 207, 0.2) 105.36%);
  // This removes the red required outline in firefox
  box-shadow: none !important;
  color: ${colors.white};
  padding-left: 0.5rem;
  box-sizing: border-box;
  ::placeholder,
  ::-webkit-input-placeholder {
    color: ${colors.white};
    font-size: 1rem;
    font-family: inherit;
    opacity: 1;
  }

  &:focus {
    outline: none;
  }

  ${theme.breakpoints.down('sm')} {
    width: 100%;
    margin-bottom: ${theme.spacing(3)}};
  }
          `
);

export default InputForm;
