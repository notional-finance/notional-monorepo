import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Maturities } from '@notional-finance/mui';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultActionContext } from '../../managers';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const CreateVaultPosition = () => {
  const { vaultAddress } = useParams<VaultParams>();
  const { updateState, state } = useContext(VaultActionContext);
  const { selectedMarketKey, borrowMarketData } = state;

  return (
    <VaultSideDrawer
      action={VAULT_ACTIONS.CREATE_VAULT_POSITION}
      canSubmit={false}
      transactionData={undefined}
      vaultAddress={vaultAddress}
    >
      <Maturities
        maturityData={borrowMarketData || []}
        onSelect={(marketKey: string | null) => {
          updateState({ selectedMarketKey: marketKey || '' });
        }}
        currentMarketKey={selectedMarketKey || ''}
        inputLabel={messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].maturity}
      />
    </VaultSideDrawer>
  );
};

// const Title = styled(LabelValue)(
//   ({ theme }) => `
//   margin-bottom: ${theme.spacing(2.5)};
//   margin-top: ${theme.spacing(5)};
//   color: ${theme.palette.borders.accentDefault};
//   text-transform: uppercase;
//   `
// );
