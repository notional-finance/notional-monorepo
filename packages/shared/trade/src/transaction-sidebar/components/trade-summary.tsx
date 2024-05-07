import {
  DataTable,
  TABLE_VARIANTS,
  MultiValueCell,
  ToolTipCell,
} from '@notional-finance/mui';
import { BaseTradeState, VaultTradeState } from '@notional-finance/notionable';
import { useTradeSummary } from '@notional-finance/notionable-hooks';
import TotalEarnings from './total-at-maturity';
import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const TradeSummary = ({
  state,
}: {
  state: BaseTradeState | VaultTradeState;
}) => {
  const { tradeType, collateral } = state;
  const { summary, earnings, totalAtMaturity } = useTradeSummary(state);

  return (
    <Box>
      {tradeType === 'LendFixed' && (
        <TotalEarnings
          totalAtMaturity={totalAtMaturity}
          collateral={collateral}
        />
      )}
      <DataTable
        tableVariant={TABLE_VARIANTS.MINI}
        tableTitle={<FormattedMessage defaultMessage={'Trade Summary'} />}
        stateZeroMessage={
          <FormattedMessage
            defaultMessage={'Input parameters to see your trade summary.'}
          />
        }
        sx={
          // Have the table hug a little closer when there is an earnings row
          earnings
            ? {
                paddingBottom: '8px',
                overflow: 'hidden',
              }
            : undefined
        }
        data={summary || []}
        columns={[
          {
            header: <FormattedMessage defaultMessage={'Description'} />,
            cell: ToolTipCell,
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
    </Box>
  );
};
