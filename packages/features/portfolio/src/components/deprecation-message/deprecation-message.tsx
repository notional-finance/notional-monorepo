import { Box, styled, useTheme } from '@mui/material';
import { Body, Button, LargeInputTextEmphasized } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const DeprecationMessage = () => {
  const theme = useTheme();

  return (
    <Container>
      <Box sx={{ marginBottom: theme.spacing(6) }}>
        <LargeInputTextEmphasized sx={{ marginBottom: theme.spacing(1) }}>
          <FormattedMessage
            defaultMessage={
              'Notional V2 is being deprecated. Notional V3 is Live!'
            }
          />
        </LargeInputTextEmphasized>
        <Body sx={{ fontSize: theme.spacing(2) }}>
          <FormattedMessage
            defaultMessage={
              '<a>Important:</a> Notional V2 will be fully deprecated by the end of July. Read the updated deprecation plan:'
            }
            values={{
              a: (msg: string) => (
                <Box component={'span'} sx={{ fontWeight: 600 }}>
                  {msg}
                </Box>
              ),
            }}
          />
        </Body>
      </Box>
      <ButtonBox>
        <Button
          variant="outlined"
          size="large"
          href="https://blog.notional.finance/notional-v2-deprecation-plan/"
        >
          <FormattedMessage defaultMessage={'Read Deprecation Blog Post'} />
        </Button>
        <Button
          variant="contained"
          size="large"
          href="https://notional.finance"
        >
          <FormattedMessage defaultMessage={'Go to Notional V3'} />
        </Button>
      </ButtonBox>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(5)};
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
  }
`
);
const ButtonBox = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(5)};
  justify-content: center;
  button {
    width: 268px;
  }
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
  }
`
);

export default DeprecationMessage;
