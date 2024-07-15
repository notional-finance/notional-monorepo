import { Box, useTheme } from '@mui/material';
import {
  TokenIcon,
  DoubleTokenIcon,
  LightningIcon,
  SentIcon,
  ReceivedIcon,
  PointsIcon,
} from '@notional-finance/icons';
import {
  TableCell,
  SmallTableCell,
  LargeTableCell,
  H5,
} from '../../typography/typography';

// export interface MultiValueIconCellProps {
//   cell: {
//     value: {
//       symbol: string;
//       label: string;
//       labelIsNegative?: boolean;
//       symbolSize?: string;
//       caption?: string;
//       inlineIcons?: boolean;
//       network?: Network;
//     };
//   };
//   row: { original };
//   column: { id; textAlign };
// }

// NOTE*
// When the table column is sortable but needs to have cells with multiple values add multiValueCellData to the table data hook.
// multiValueCellData object must have the same key as accessor of cell that has multiple values.
// The value passed for that accessor in the table data must be the raw string or number value for the column to be sortable.

// Example:
// multiValueCellData: {
//   currency: {
//     symbol: underlying.symbol,
//     iconComponent: iconComponent,
//     label: underlying.symbol,
//     caption: formatYieldCaption(data),
//   },
// },

export const MultiValueIconCell = (props): JSX.Element => {
  const theme = useTheme();
  const {
    cell: { getValue },
    row: { original },
    column,
  } = props;
  const value = getValue();
  const FirstValue = column.columnDef?.expandableTable
    ? LargeTableCell
    : TableCell;
  const SecondValue = column.columnDef?.expandableTable
    ? TableCell
    : SmallTableCell;

  const values = original.multiValueCellData
    ? original.multiValueCellData[column.id]
    : value;

  // NOTE* Displays a token icon on the same line as the caption or label values. Based on the values.symbol and the captionSymbol.
  // Currently used in the Markets table
  const inlineIcons = values?.inlineIcons;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: column.columnDef.textAlign,
      }}
    >
      {!original.isTotalRow && !inlineIcons ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {values?.symbol && values.symbolBottom && (
            <DoubleTokenIcon
              size="medium"
              symbolTop={values?.symbol}
              symbolBottom={values?.symbolBottom}
            />
          )}
          {values?.symbol && !values.symbolBottom && (
            <TokenIcon
              symbol={values?.symbol}
              network={values.network}
              size={values?.symbolSize || 'medium'}
            />
          )}
          {values?.IconComponent && values.IconComponent}
          {column.columnDef?.showSentAndReceivedIcons &&
            (values.showSentIcon ? (
              <SentIcon fill={theme.palette.primary.dark} />
            ) : (
              <ReceivedIcon fill={theme.palette.primary.main} />
            ))}
        </Box>
      ) : null}
      <Box
        sx={{
          marginLeft: theme.spacing(1),
        }}
      >
        <FirstValue
          gutter="default"
          sx={{
            marginBottom: inlineIcons ? '4px' : '0px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: column.columnDef.textAlign,
            color: values?.labelIsNegative
              ? theme.palette.error.main
              : 'inherit',
          }}
        >
          {original.isDividerRow ? (
            <H5 sx={{ color: theme.palette.common.black }}>{values?.label}</H5>
          ) : (
            <>
              {values?.symbol && values.symbolBottom && (
                <LightningIcon sx={{ height: '13px', marginLeft: '-6px' }} />
              )}
              {inlineIcons && (
                <TokenIcon
                  network={values.network || undefined}
                  symbol={values.symbol}
                  size="small"
                  style={{ marginRight: theme.spacing(0.5) }}
                />
              )}
              <Box
                sx={{
                  minWidth: !inlineIcons ? theme.spacing(8) : '',
                }}
              >
                {column.columnDef?.showPointsIcon && (
                  <PointsIcon
                    sx={{
                      height: theme.spacing(2),
                      width: theme.spacing(2),
                      marginRight: theme.spacing(0.5),
                    }}
                  />
                )}
                {column.columnDef.displayFormatter &&
                values?.label !== undefined
                  ? column.columnDef.displayFormatter(values?.label)
                  : values?.label}
              </Box>
            </>
          )}
        </FirstValue>
        <SecondValue
          sx={{
            marginBottom: '0px',
            color: theme.palette.typography.light,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: column.columnDef.textAlign,
          }}
        >
          {inlineIcons && values?.captionSymbol && (
            <TokenIcon
              symbol={values.captionSymbol}
              size="small"
              style={{ marginRight: theme.spacing(0.5) }}
            />
          )}
          {values?.caption || ''}
        </SecondValue>
      </Box>
    </Box>
  );
};

export default MultiValueIconCell;
