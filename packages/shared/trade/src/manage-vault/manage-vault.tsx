import { Box, styled, useTheme } from '@mui/material';
import {
  H4,
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useManageVault,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { useHistory } from 'react-router-dom';

export const ManageVault = ({ vaultAddress }: { vaultAddress?: string }) => {
  const theme = useTheme();
  const history = useHistory();
  const { reduceLeverageOptions, manageVaultOptions } = useManageVault();
  const { vaultName } = useVaultProperties(vaultAddress);

  return (
    <Box>
      <LargeInputTextEmphasized
        gutter="default"
        sx={{ marginBottom: theme.spacing(5) }}
      >
        <FormattedMessage
          defaultMessage={'Manage {vaultName} Vault'}
          values={{
            vaultName,
          }}
        />
      </LargeInputTextEmphasized>
      {reduceLeverageOptions.length > 0 && (
        <>
          <Title>
            <FormattedMessage defaultMessage={'Reduce leverage'} />
          </Title>
          {reduceLeverageOptions.map(({ label, link }, index) => (
            <SideDrawerButton
              key={index}
              sx={{ padding: theme.spacing(2.5) }}
              onClick={() => history.push(link)}
            >
              <H4>{label}</H4>
            </SideDrawerButton>
          ))}
          <Box
            component={'hr'}
            sx={{
              margin: theme.spacing(5, 0),
              border: `1px solid ${theme.palette.borders.default}`,
            }}
          />
        </>
      )}
      {manageVaultOptions.map(({ label, link }, index) => (
        <SideDrawerButton
          key={index}
          sx={{ padding: theme.spacing(2.5) }}
          onClick={() => history.push(link)}
        >
          <H4>{label}</H4>
        </SideDrawerButton>
      ))}
    </Box>
  );
};

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(5)};
  color: ${theme.palette.borders.accentDefault};
  font-weight: 700;
  text-transform: uppercase;
  `
);
