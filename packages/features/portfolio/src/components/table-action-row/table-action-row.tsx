import { ReactNode } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { ActionRowButton } from '../action-row-button/action-row-button';
import { H5, H4, ButtonBar, ButtonOptionsType } from '@notional-finance/mui';
import { defineMessages } from 'react-intl';

interface TableActionRowProps {
  row: {
    original: {
      amount: any;
      entryPrice: any;
      currentPrice: any;
      actionRow: {
        txnHistory: string;
        buttonBarData: ButtonOptionsType[];
        subRowData: {
          label: ReactNode;
          value: any;
        }[];
      };
    };
  };
}

export const TableActionRow = ({ row }: TableActionRowProps) => {
  const theme = useTheme();
  const {
    actionRow: { txnHistory, buttonBarData, subRowData },
  } = row.original;

  return (
    <Container>
      <ApyContainer>
        {subRowData.map(({ label, value }) => (
          <Box>
            <Label>{label}</Label>
            <H4>{value}</H4>
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
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  height: ${theme.spacing(18)};
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
  margin-right: ${theme.spacing(3)};
  `
);

const Label = styled(H5)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(1)};
  `
);
