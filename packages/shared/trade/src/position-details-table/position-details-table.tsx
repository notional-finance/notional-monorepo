import { Box, useTheme } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
  DataTableColumn,
  ErrorMessage,
  ToolTipCell,
  MultiValueCell,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { tradeErrors } from '../tradeErrors';
import React from 'react';

interface PositionDetailsTableProps {
  title: React.ReactNode;
  hideUpdatedColumn?: boolean;
  maturity?: string;
  onlyCurrent: boolean;
  tooRisky: boolean;
  tableData: {
    label:
      | {
          text: {
            content: MessageDescriptor;
            toolTipContent?: MessageDescriptor;
          };
        }
      | string;
    current:
      | string
      | {
          data: {
            displayValue: string;
            isNegative?: boolean;
            showPositiveAsGreen?: boolean;
            textColor?: string;
          }[];
        };
    updated: {
      value: string;
      arrowUp: boolean;
      checkmark: boolean;
      greenOnCheckmark: boolean;
      greenOnArrowUp: boolean | undefined;
    };
  }[];
}

export const PositionDetailsTable = ({
  title,
  hideUpdatedColumn,
  tableData,
  maturity,
  tooRisky,
  onlyCurrent,
}: PositionDetailsTableProps) => {
  const theme = useTheme();

  const TABLE_COLUMNS: DataTableColumn[] = [
    {
      header: (
        <FormattedMessage
          defaultMessage="Detail"
          description={'Detail header'}
        />
      ),
      cell: ToolTipCell,
      accessorKey: 'label',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Current"
          description={'Current header'}
        />
      ),
      cell: MultiValueCell,
      accessorKey: 'current',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Updated"
          description={'Updated header'}
        />
      ),
      tooRisky,
      cell: ArrowIndicatorCell,
      accessorKey: 'updated',
      textAlign: 'right',
    },
  ];

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
