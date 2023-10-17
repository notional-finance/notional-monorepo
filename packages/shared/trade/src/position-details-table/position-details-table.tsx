import { Box, useTheme } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
  DataTableColumn,
  ErrorMessage,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { tradeErrors } from '../tradeErrors';
import React from 'react';

interface PositionDetailsTableProps {
  title: React.ReactNode;
  hideUpdatedColumn?: boolean;
  maturity?: string;
  onlyCurrent: boolean;
  tooRisky: boolean;
  tableData: {
    label: string;
    current: string;
    updated: {
      value: string;
      arrowUp: boolean;
      checkmark: boolean;
      greenOnCheckmark: boolean;
      greenOnArrowUp: boolean | undefined;
    };
  }[];
}

const TABLE_COLUMNS: DataTableColumn[] = [
  {
    Header: (
      <FormattedMessage defaultMessage="Detail" description={'Detail header'} />
    ),
    accessor: 'label',
    textAlign: 'left',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Current"
        description={'Current header'}
      />
    ),
    accessor: 'current',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Updated"
        description={'Updated header'}
      />
    ),
    Cell: ArrowIndicatorCell,
    accessor: 'updated',
    textAlign: 'right',
  },
];

export const PositionDetailsTable = ({
  title,
  hideUpdatedColumn,
  tableData,
  maturity,
  tooRisky,
  onlyCurrent,
}: PositionDetailsTableProps) => {
  const theme = useTheme();

  return (
    <Box>
      {tooRisky && !hideUpdatedColumn && (
        <ErrorMessage
          variant="error"
          title={<FormattedMessage {...tradeErrors.liquidationRisk} />}
          message={
            <FormattedMessage {...tradeErrors.leverageLiquidationRiskMsg} />
          }
          marginBottom
        />
      )}
      <DataTable
        sx={{
          border: tooRisky
            ? `1px solid ${theme.palette.error.main}`
            : theme.shape.borderStandard,
        }}
        data={tableData}
        columns={
          hideUpdatedColumn || onlyCurrent
            ? TABLE_COLUMNS.slice(0, 2)
            : TABLE_COLUMNS
        }
        stateZeroMessage={
          <FormattedMessage defaultMessage="Input parameters to see your vault details." />
        }
        tableTitle={
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{title}</div>
            {maturity && (
              <div>
                <FormattedMessage
                  defaultMessage="Maturity: {maturity}"
                  values={{ maturity }}
                />
              </div>
            )}
          </Box>
        }
        tableVariant={TABLE_VARIANTS.MINI}
        tableLoading={false}
      />
    </Box>
  );
};
