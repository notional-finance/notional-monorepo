import { useContext, useEffect } from 'react';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import {
  ButtonData,
  ButtonText,
  ManageSideDrawer,
  SideDrawerButton,
} from '@notional-finance/mui';
import { useVaultProperties } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault';
import { messages } from '../messages';
import { VaultDetailsTable } from '../components';
import { useManageVault } from '../hooks/use-manage-vault';

export const ManageVault = () => {
  const {
    state: { vaultAddress, selectedNetwork },
  } = useContext(VaultActionContext);
  const { reduceLeverageOptions, manageVaultOptions, rollMaturityOptions } =
    useManageVault();
  const { vaultName } = useVaultProperties(selectedNetwork, vaultAddress);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const optionSections = [
    {
      buttons: manageVaultOptions.map(({ label, link }, index) => (
        <SideDrawerButton key={index} to={link}>
          <ButtonText>{label}</ButtonText>
        </SideDrawerButton>
      )),
    },
    {
      title: <FormattedMessage defaultMessage={'Reduce Leverage'} />,
      buttons: reduceLeverageOptions.map(({ label, link }, index) => (
        <SideDrawerButton key={index} to={link}>
          <ButtonText>{label}</ButtonText>
        </SideDrawerButton>
      )),
    },
    {
      title: <FormattedMessage defaultMessage={'Convert Maturity'} />,
      buttons: rollMaturityOptions.map(
        ({ label, link, totalAPY, onClick }, index) => (
          <SideDrawerButton key={index} to={link} onClick={onClick}>
            <ButtonText sx={{ display: 'flex', flex: 1 }}>{label}</ButtonText>
            <ButtonData>{totalAPY}</ButtonData>
          </SideDrawerButton>
        )
      ),
    },
  ];

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
      portfolioLink="/portfolio/vaults"
      optionSections={optionSections}
    />
  );
};
