import { Box, styled, useTheme } from '@mui/material';
import { Body, Button, LargeInputTextEmphasized } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

interface LendBorrowMigrationProps {
  safeAddress: string;
  isLend?: boolean;
}

export const LendBorrowMigration = ({
  safeAddress,
  isLend,
}: LendBorrowMigrationProps) => {
  const theme = useTheme();

  return (
    <Container>
      <Box>
        <LargeInputTextEmphasized sx={{ marginBottom: theme.spacing(3) }}>
          <FormattedMessage
            defaultMessage={'Your Position has Migrated to Notional V3'}
          />
        </LargeInputTextEmphasized>
        {isLend && (
          <Body sx={{ fontSize: theme.spacing(2), width: '91%' }}>
            <FormattedMessage
              defaultMessage={
                'Your lending position has been migrated to V3. Click the following link to go to Notional V3 and view/manage your position.'
              }
            />
          </Body>
        )}
        {safeAddress && (
          <>
            <Body
              sx={{
                fontSize: theme.spacing(2),
                width: '91%',
                marginTop: '24px',
              }}
            >
              <FormattedMessage
                defaultMessage={
                  'Your collateral and debt position have been migrated to Notional V3 and are held in a Gnosis safe where you are the sole signer. Your safe address is: <a></a>'
                }
                values={{
                  a: () => (
                    <Box
                      component={'a'}
                      href={`https://app.safe.global/home?safe=eth:${safeAddress}`}
                      sx={{
                        color: theme.palette.typography.accent,
                        textDecoration: 'underline',
                      }}
                      target="_blanks"
                    >
                      {safeAddress}
                    </Box>
                  ),
                }}
              />
            </Body>
            <Body
              sx={{ fontSize: theme.spacing(2), marginTop: theme.spacing(3) }}
            >
              <FormattedMessage
                defaultMessage={
                  'You can view and manage your position on Notional V3.'
                }
              />
            </Body>
          </>
        )}
      </Box>
      <ButtonBox>
        <Button variant="outlined" size="large" href="https://notional.finance">
          <FormattedMessage defaultMessage={'View Notional V3'} />
        </Button>
      </ButtonBox>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
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

export default LendBorrowMigration;
