import { VaultActionContext } from '../vault-view/vault-action-provider';
import { VaultSideDrawer } from '../components';
import { useContext } from 'react';

export const RollMaturity = () => {
  const context = useContext(VaultActionContext);

  return <VaultSideDrawer context={context} />;
};
