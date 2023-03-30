import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import {
  H4,
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useManageVault } from './use-manage-vault';
import { useQueryParams } from '@notional-finance/utils';
import { useVault } from '@notional-finance/notionable-hooks';
import { messages } from '../messages';

export const ManageVault = () => {
  const theme = useTheme();
  const { vaultAddress } = useQueryParams();
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
      {reduceLeverageOptions.length > 0 && (
        <>
          <Title>
            <FormattedMessage defaultMessage={'Reduce leverage'} />
          </Title>
          {reduceLeverageOptions.map(({ label, link }, index) => (
            <H4 fontWeight="regular" to={link} key={index}>
              <SideDrawerButton sx={{ padding: theme.spacing(2.5) }}>
                {label}
              </SideDrawerButton>
            </H4>
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
        <H4 fontWeight="regular" to={link} key={index}>
          <SideDrawerButton sx={{ padding: theme.spacing(2.5) }}>
            {label}
          </SideDrawerButton>
        </H4>
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
