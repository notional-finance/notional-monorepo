import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useTradeSummary } from '@notional-finance/notionable-hooks';
import { FormattedMessage, defineMessage } from 'react-intl';

export const TradeSummary = ({ state }: { state: BaseTradeState }) => {
  const { summary /* total */ } = useTradeSummary(state);
  return (
    <DataTable
      tableVariant={TABLE_VARIANTS.MINI}
      tableTitle={<FormattedMessage defaultMessage={'Trade Summary'} />}
      stateZeroMessage={defineMessage({
        defaultMessage: 'Input parameters to see your trade summary.',
      })}
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
          textAlign: 'right',
        },
      ]}
    />
  );
};
