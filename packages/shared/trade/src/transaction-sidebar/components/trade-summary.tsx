import {
  DataTable,
  TABLE_VARIANTS,
  MultiValueCell,
} from '@notional-finance/mui';
import { BaseTradeState, VaultTradeState } from '@notional-finance/notionable';
import { useTradeSummary } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const TradeSummary = ({
  state,
}: {
  state: BaseTradeState | VaultTradeState;
}) => {
  const { summary } = useTradeSummary(state);

  return (
    <DataTable
      tableVariant={TABLE_VARIANTS.MINI}
      tableTitle={<FormattedMessage defaultMessage={'Trade Summary'} />}
      stateZeroMessage={
        <FormattedMessage
          defaultMessage={'Input parameters to see your trade summary.'}
        />
      }
      data={summary || []}
      columns={[
        {
          Header: <FormattedMessage defaultMessage={'Description'} />,
          accessor: 'label',
          textAlign: 'left',
        },
        {
          Header: <FormattedMessage defaultMessage={'Value'} />,
          accessor: 'value',
          Cell: MultiValueCell,
          textAlign: 'right',
        },
      ]}
    />
  );
};
