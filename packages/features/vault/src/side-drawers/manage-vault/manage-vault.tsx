import { Box, styled, useTheme, Divider } from '@mui/material';
import { useContext } from 'react';
import {
  PORTFOLIO_ACTIONS,
  VAULT_ACTIONS,
} from '@notional-finance/shared-config';
import { VaultRiskTable } from '@notional-finance/risk';
import {
  H4,
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
} from '@notional-finance/mui';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useManageVault } from './use-manage-vault';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { useVault } from '@notional-finance/notionable-hooks';
import { messages } from '../messages';

interface VaultParams {
  vaultAddress?: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const ManageVault = () => {
  const theme = useTheme();
  const { vaultAddress } = useParams<VaultParams>();
  const {
    state: { eligibleActions, updatedVaultAccount },
  } = useContext(VaultActionContext);
  const { manageVaultActions } = useManageVault();
  const { vaultName } = useVault(vaultAddress);

  return (
    <Box>
      {vaultAddress && (
        <MainWrapper>
          <TableWrapper>
            <LargeInputTextEmphasized
              gutter="default"
              sx={{ marginBottom: theme.spacing(5) }}
            >
              <FormattedMessage
                {...messages[PORTFOLIO_ACTIONS.MANAGE_VAULT].headingTwo}
                values={{
                  vaultName,
                }}
              />
              <H4
                to="/portfolio/vaults"
                sx={{
                  marginTop: theme.spacing(3),
                  textDecoration: 'underline',
                  color: theme.palette.typography.accent,
                }}
              >
                <FormattedMessage defaultMessage={'View in Portfolio'} />
              </H4>
            </LargeInputTextEmphasized>
            <VaultRiskTable
              key={'vault-risk-table'}
              updatedVaultAccount={updatedVaultAccount}
              vaultAddress={vaultAddress}
              hideUpdatedColumn={true}
            />
          </TableWrapper>

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
            {eligibleActions?.includes(VAULT_ACTIONS.DEPOSIT_COLLATERAL) && (
              <Title>
                <FormattedMessage defaultMessage={'Reduce leverage'} />
              </Title>
            )}
            {eligibleActions?.map((key, index) => (
              <Box key={index}>
                {key === VAULT_ACTIONS.INCREASE_POSITION && (
                  <Divider
                    sx={{
                      margin: theme.spacing(5, 0),
                      border: `1px solid ${theme.palette.borders.default}`,
                    }}
                  ></Divider>
                )}
                <H4 fontWeight="regular" to={manageVaultActions[key].link}>
                  <SideDrawerButton sx={{ padding: theme.spacing(2.5) }}>
                    {manageVaultActions[key].label}
                  </SideDrawerButton>
                </H4>
              </Box>
            ))}
          </Box>
        </MainWrapper>
      )}
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

const TableWrapper = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(5)};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(5)};
  }
  `
);

const MainWrapper = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    display: flex;
    flex-direction: column-reverse;
  }
  `
);
