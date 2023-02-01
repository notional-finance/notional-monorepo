import { Box, styled, useTheme } from '@mui/material';
import {
  PORTFOLIO_ACTIONS,
  VAULT_ACTIONS,
} from '@notional-finance/shared-config';
import {
  H4,
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
} from '@notional-finance/mui';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useManageVault } from './use-manage-vault';
import { useVault } from '@notional-finance/notionable-hooks';
import { messages } from '../messages';

interface VaultParams {
  vaultAddress?: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const ManageVault = () => {
  const theme = useTheme();
  const { vaultAddress } = useParams<VaultParams>();
  const { reduceLeverageOptions, manageVaultOptions } = useManageVault();
  const { vaultName } = useVault(vaultAddress);

  return (
    <Box>
      <LargeInputTextEmphasized
        gutter="default"
        sx={{ marginBottom: theme.spacing(5) }}
      >
        <FormattedMessage
          {...messages[PORTFOLIO_ACTIONS.MANAGE_VAULT].heading}
          values={{
            vaultName,
          }}
        />
      </LargeInputTextEmphasized>
      <Title>
        <FormattedMessage defaultMessage={'Reduce leverage'} />
      </Title>
      {reduceLeverageOptions.map(({ label, link }, index) => (
        <SideDrawerButton key={index} sx={{ padding: '0px' }}>
          <H4
            fontWeight="regular"
            to={link}
            sx={{ padding: theme.spacing(2.5) }}
          >
            {label}
          </H4>
        </SideDrawerButton>
      ))}
      <Box
        component={'hr'}
        sx={{
          margin: theme.spacing(5, 0),
          border: `1px solid ${theme.palette.borders.default}`,
        }}
      ></Box>
      {manageVaultOptions.map(({ label, link }, index) => (
        <SideDrawerButton key={index} sx={{ padding: '0px' }}>
          <H4
            fontWeight="regular"
            to={link}
            sx={{ padding: theme.spacing(2.5) }}
          >
            {label}
          </H4>
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
  text-transform: uppercase;
  `
);
