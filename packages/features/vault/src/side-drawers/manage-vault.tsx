import { ReactNode, useContext, useEffect } from 'react';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import {
  ButtonData,
  ButtonText,
  ManageSideDrawer,
  SideDrawerButton,
} from '@notional-finance/mui';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault';
import { messages } from '../messages';
import { VaultDetailsTable } from '../components';
import { useManageVault } from '../hooks/use-manage-vault';
import { useTheme } from '@mui/material';

export const ManageVault = () => {
  const theme = useTheme();
  const {
    state: { selectedNetwork },
  } = useContext(VaultActionContext);
  const {
    manageVaultOptions,
    rollMaturityOptions,
    vaultName,
    infoMessage,
    extendedVaultOptions,
    extendedVaultTitle,
  } = useManageVault();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const optionSections: {
    title?: ReactNode;
    buttons: ReactNode[];
  }[] = [
    {
      buttons: manageVaultOptions.map(({ label, link }, index) => (
        <SideDrawerButton key={index} to={link}>
          <ButtonText>{label}</ButtonText>
        </SideDrawerButton>
      )),
    },
    {
      title: <FormattedMessage defaultMessage={'Adjust Borrow Maturity'} />,
      buttons: rollMaturityOptions.map(({ label, link, totalAPY }, index) => (
        <SideDrawerButton
          key={index}
          to={link}
          variant="outlined"
          sx={{
            border: `1px solid ${theme.palette.primary.light}`,
            background: 'unset',
            ':hover': {
              background: theme.palette.info.light,
              '.button-data': {
                background: theme.palette.background.default,
              },
            },
          }}
        >
          <ButtonText
            sx={{
              display: 'flex',
              flex: 1,
            }}
          >
            {label}
          </ButtonText>
          {totalAPY !== undefined && (
            <ButtonData
              className={`button-data`}
              sx={{
                background: theme.palette.info.light,
                border: 'unset',
              }}
            >{`${formatNumberAsPercent(totalAPY)} Total APY`}</ButtonData>
          )}
        </SideDrawerButton>
      )),
    },
  ];

  if (extendedVaultTitle) {
    optionSections.push({
      title: extendedVaultTitle,
      buttons: extendedVaultOptions.map(({ label, link }, index) => (
        <SideDrawerButton key={index} to={link}>
          <ButtonText>{label}</ButtonText>
        </SideDrawerButton>
      )),
    });
  }

  return (
    <ManageSideDrawer
      heading={
        <FormattedMessage
          {...messages[PORTFOLIO_ACTIONS.MANAGE_VAULT].headingTwo}
          values={{
            vaultName,
          }}
        />
      }
      detailsTable={
        <VaultDetailsTable key={'vault-risk-table'} hideUpdatedColumn={true} />
      }
      portfolioLink={`/portfolio/${selectedNetwork}/vaults`}
      infoMessage={infoMessage}
      optionSections={optionSections}
    />
  );
};
