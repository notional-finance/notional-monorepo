import { ReactNode } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ActionRowButton } from '../action-row-button/action-row-button';
import {
  H5,
  H4,
  ButtonBar,
  ButtonOptionsType,
  DataTableColumn,
  DataTable,
  ProgressIndicator,
  ErrorMessage,
} from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { defineMessages } from 'react-intl';
import { TABLE_WARNINGS } from '@notional-finance/util';

const messages = {
  [TABLE_WARNINGS.HIGH_UTILIZATION_NTOKEN]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused IL. IL will go away when fixed rates return to normal range.',
      description: '',
    },
  }),
  [TABLE_WARNINGS.HIGH_UTILIZATION_FCASH]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused temporary fCash price declines. Your fixed rate is guaranteed if you hold until maturity.',
      description: '',
    },
  }),
};

interface TableActionRowProps {
  row: {
    original: {
      amount: any;
      entryPrice: any;
      currentPrice: any;
      isDebt: boolean;
      actionRow: {
        warning: TABLE_WARNINGS | undefined;
        txnHistory: string;
        buttonBarData: ButtonOptionsType[];
        riskTableData: any[];
        riskTableColumns: DataTableColumn[];
        subRowData: {
          label: ReactNode;
          value: any;
          showLoadingSpinner?: boolean;
        }[];
        hasMatured?: boolean;
      };
      asset;
      isPending?: boolean;
    };
  };
}

export const TableActionRow = ({ row }: TableActionRowProps) => {
  const theme = useTheme();
  const {
    actionRow: {
      txnHistory,
      buttonBarData,
      subRowData,
      riskTableData,
      riskTableColumns,
      hasMatured,
      warning,
    },
    isDebt,
    asset,
    isPending,
  } = row.original;

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        paddingBottom:
          (riskTableData && riskTableData.length > 0) || hasMatured
            ? theme.spacing(4)
            : '0px',
      }}
    >
      <Container>
        <ApyContainer>
          {subRowData.map(({ label, value, showLoadingSpinner }, index) => (
            <Box key={index}>
              <Label>{label}</Label>
              {isPending && showLoadingSpinner ? (
                <ProgressIndicator
                  circleSize={16}
                  sx={{
                    alignItems: 'baseline',
                  }}
                />
              ) : (
                <H4
                  sx={{
                    color:
                      (value < 0 || value.includes('-')) && !isDebt
                        ? colors.red
                        : '',
                  }}
                >
                  {value}
                </H4>
              )}
            </Box>
          ))}
        </ApyContainer>
        <ButtonContainer>
          <ButtonBar
            buttonOptions={buttonBarData}
            sx={{
              height: theme.spacing(5),
            }}
          />
          {txnHistory && (
            <ActionRowButton
              variant="outlined"
              size="medium"
              {...defineMessages({
                label: {
                  defaultMessage: 'Transaction History',
                  description: 'button text',
                },
              })}
              route={txnHistory}
              sx={{ marginLeft: theme.spacing(3) }}
            />
          )}
        </ButtonContainer>
      </Container>
      {hasMatured && (
        <Box
          sx={{ margin: theme.spacing(0, 7), paddingBottom: theme.spacing(5) }}
        >
          <ErrorMessage
            variant="pending"
            title={<FormattedMessage defaultMessage={'Asset Matured'} />}
            message={
              <FormattedMessage
                defaultMessage={
                  'Your matured {symbol} is currently earning the variable lending rate. You can roll to a new fixed rate or do nothing and continue earning the variable rate.'
                }
                values={{
                  symbol: asset.symbol,
                }}
              />
            }
            maxWidth={'100%'}
            sx={{ marginTop: '0px' }}
          />
        </Box>
      )}
      {warning && (
        <Box
          sx={{ margin: theme.spacing(0, 7), paddingBottom: theme.spacing(5) }}
        >
          <ErrorMessage
            variant="warning"
            title={<FormattedMessage {...messages[warning].title} />}
            message={<FormattedMessage {...messages[warning].message} />}
            maxWidth={'100%'}
            sx={{ marginTop: '0px' }}
          />
        </Box>
      )}
      {riskTableData && riskTableData.length > 0 && (
        <DataTable
          tableTitle={<FormattedMessage defaultMessage={'Liquidation Risk'} />}
          columns={riskTableColumns}
          data={riskTableData}
          sx={{
            width: '96%',
            margin: `auto`,
            paddingBottom: theme.spacing(3),
          }}
        />
      )}
    </Box>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing(5, 0)};
  align-items: center;
  background: ${theme.palette.background.default};
`
);

const ApyContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(5)};
  margin-left: ${theme.spacing(7)};
  `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  margin-right: ${theme.spacing(7)};
  `
);

const Label = styled(H5)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(1)};
  `
);
