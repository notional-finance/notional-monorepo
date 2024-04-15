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

  console.log({ summary });

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
          header: <FormattedMessage defaultMessage={'Description'} />,
          accessorKey: 'label',
          textAlign: 'left',
        },
        {
          header: <FormattedMessage defaultMessage={'Value'} />,
          accessorKey: 'value',
          cell: MultiValueCell,
          textAlign: 'right',
        },
      ]}
    />
  );
};
