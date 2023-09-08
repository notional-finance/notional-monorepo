import { Box, styled, useTheme } from '@mui/material';
import { useContext, useEffect } from 'react';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import {
  H4,
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
} from '@notional-finance/mui';
import {
  useManageVault,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { VaultDetailsTable } from '../components';

export const ManageVault = () => {
  const theme = useTheme();
  const {
    state: { vaultAddress, priorAccountRisk },
  } = useContext(VaultActionContext);
  const { vaultName } = useVaultProperties(vaultAddress);
  const { reduceLeverageOptions, manageVaultOptions } = useManageVault(
    vaultAddress,
    !!priorAccountRisk
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box>
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

        {reduceLeverageOptions.length > 0 && (
          <>
            <Title>
              <FormattedMessage defaultMessage={'Reduce leverage'} />
            </Title>
            {reduceLeverageOptions.map(({ label, link }, index) => (
              <SideDrawerButton
                key={index}
                sx={{ padding: theme.spacing(2.5) }}
                to={link}
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
            to={link}
          >
            <H4>{label}</H4>
          </SideDrawerButton>
        ))}
      </MainWrapper>
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

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(5)};
  color: ${theme.palette.borders.accentDefault};
  font-weight: 700;
  text-transform: uppercase;
  `
);
