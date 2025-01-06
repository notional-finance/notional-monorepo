import { FormattedMessage } from 'react-intl';
import { useVaultDetailsTable } from '../hooks/use-vault-details-table';
import { PositionDetailsTable } from '@notional-finance/trade';
import { observer } from 'mobx-react-lite';

interface VaultDetailsTableProps {
  hideUpdatedColumn?: boolean;
}

export const VaultDetailsTable = observer(
  ({ hideUpdatedColumn }: VaultDetailsTableProps) => {
    const { tableData, maturity, tooRisky, onlyCurrent } =
      useVaultDetailsTable();

    return (
      <PositionDetailsTable
        title={<FormattedMessage defaultMessage={'Vault Details'} />}
        hideUpdatedColumn={hideUpdatedColumn}
        tableData={tableData}
        maturity={maturity}
        tooRisky={tooRisky}
        onlyCurrent={onlyCurrent}
      />
    );
  }
);
