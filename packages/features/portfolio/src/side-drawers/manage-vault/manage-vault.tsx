import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import {
  H4,
  LinkText,
  LabelValue,
  LargeInputTextEmphasized,
  SideDrawerButton,
} from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
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
      <Title>
        <FormattedMessage defaultMessage={'Reduce leverage'} />
      </Title>
      {reduceLeverageOptions.map(({ label, link, key }, index) => (
        <Link to={link}>
          <SideDrawerButton key={index}>
            <LinkText
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              <H4
                sx={{
                  flex: 1,
                  color: theme.palette.common.black,
                }}
                fontWeight="regular"
              >
                {label}
              </H4>
            </LinkText>
          </SideDrawerButton>
        </Link>
      ))}
      <Box
        component={'hr'}
        sx={{
          margin: theme.spacing(5, 0),
          border: `1px solid ${theme.palette.borders.default}`,
        }}
      ></Box>
      {manageVaultOptions.map(({ label, link, key }, index) => (
        <Link to={link}>
          <SideDrawerButton key={index}>
            <LinkText
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              <H4
                sx={{
                  flex: 1,
                  color: theme.palette.common.black,
                }}
                fontWeight="regular"
              >
                {label}
              </H4>
            </LinkText>
          </SideDrawerButton>
        </Link>
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
