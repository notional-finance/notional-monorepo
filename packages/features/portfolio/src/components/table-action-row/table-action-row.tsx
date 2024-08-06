import { ReactNode } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { HistoryIcon } from '@notional-finance/icons';
import {
  H5,
  H4,
  ButtonBar,
  ButtonOptionsType,
  ProgressIndicator,
  ErrorMessage,
} from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { defineMessages } from 'react-intl';
import { TABLE_WARNINGS } from '@notional-finance/util';
import { useHistory } from 'react-router';

const messages = {
  [TABLE_WARNINGS.HIGH_UTILIZATION_NTOKEN]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused IL. IL will go away when fixed rates go down.',
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

export interface TableActionRowProps {
  row: {
    original: {
      amount: any;
      entryPrice: any;
      currentPrice: any;
      isDebt: boolean;
      actionRow: {
        stakeNoteStatus?: {
          inCoolDown: boolean;
          inRedeemWindow: boolean;
          redeemWindowBegin: number;
          redeemWindowEnd: number;
        };
        warning: TABLE_WARNINGS | undefined;
        txnHistory: string;
        buttonBarData: ButtonOptionsType[];
        subRowData: {
          label: ReactNode;
          value: any;
          showLoadingSpinner?: boolean;
        }[];
        hasMatured?: boolean;
        pointsWarning?: boolean;
      };
      asset;
      isPending?: boolean;
    };
  };
}

export const TableActionRow = ({ row }: TableActionRowProps) => {
  const theme = useTheme();
  const history = useHistory();
  const {
    actionRow: {
      txnHistory,
      buttonBarData,
      subRowData,
      pointsWarning,
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
        paddingBottom: hasMatured ? theme.spacing(4) : '0px',
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
              ) : typeof value === 'string' || typeof value === 'number' ? (
                <H4
                  sx={{
                    color:
                      ((value as number) < 0 ||
                        (value as string).includes('-')) &&
                      !isDebt
                        ? colors.red
                        : '',
                  }}
                >
                  {value}
                </H4>
              ) : (
                value
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
            <Box
              onClick={() => history.push(txnHistory)}
              sx={{
                cursor: 'pointer',
                height: theme.spacing(5),
                border: `1px solid ${theme.palette.typography.accent}`,
                borderRadius: theme.shape.borderRadius,
                padding: theme.spacing(1),
                marginLeft: theme.spacing(3),
              }}
            >
              <HistoryIcon
                sx={{
                  fill: theme.palette.typography.accent,
                  marginLeft: '2px',
                }}
              />
            </Box>
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
      {pointsWarning && (
        <Box
          sx={{ margin: theme.spacing(0, 7), paddingBottom: theme.spacing(5) }}
        >
          <ErrorMessage
            variant="pending"
            title={<FormattedMessage defaultMessage={'APY Estimation'} />}
            message={
              <FormattedMessage
                defaultMessage={
                  'This leveraged vault earns APY from points. Track and claim your points from the partner protocol site.'
                }
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
  gap: ${theme.spacing(3)};
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
