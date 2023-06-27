import { Box, styled, useTheme } from '@mui/material';
import { useContext, useEffect } from 'react';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { H4, LargeInputTextEmphasized } from '@notional-finance/mui';
import { useVaultProperties } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { VaultDetailsTable } from '../components';

export const ManageVault = () => {
  const theme = useTheme();
  const {
    state: { vaultAddress },
  } = useContext(VaultActionContext);
  const { vaultName } = useVaultProperties(vaultAddress);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            </LargeInputTextEmphasized>
            <VaultDetailsTable
              key={'vault-risk-table'}
              hideUpdatedColumn={true}
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
          </TableWrapper>

          <ManageVault />
        </MainWrapper>
      )}
    </Box>
  );
};

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
