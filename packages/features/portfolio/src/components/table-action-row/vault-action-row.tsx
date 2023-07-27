import { Box, useTheme, styled } from '@mui/material';
import { ActionRowButton } from '../action-row-button/action-row-button';
import { H5, H4, ButtonBar, ButtonOptionsType } from '@notional-finance/mui';
import { FormattedMessage, defineMessages } from 'react-intl';
import { useHistory } from 'react-router-dom';

interface VaultActionRowProps {
  row: {
    original: {
      borrowAPY: any;
      strategyAPY: any;
      leverageRatio: any;
      actionRow: {
        maturity: string;
        routes: {
          manage: string;
          withdraw: string;
          txnHistory: string;
        };
      };
    };
  };
}

export const VaultActionRow = ({ row }: VaultActionRowProps) => {
  const theme = useTheme();
  const history = useHistory();
  const {
    borrowAPY,
    strategyAPY,
    leverageRatio,
    actionRow: { routes },
  } = row.original;

  const buttonData: ButtonOptionsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Manage'} />,
      callback: () => {
        history.push(routes.manage);
      },
    },
    {
      buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
      callback: () => {
        history.push(routes.withdraw);
      },
    },
  ];

  return (
    <Container>
      <ApyContainer>
        <Box>
          <Label>
            <FormattedMessage defaultMessage={'Borrow APY'} />
          </Label>
          <H4>{borrowAPY.displayValue}</H4>
        </Box>
        <Box>
          <Label>
            <FormattedMessage defaultMessage={'Strategy APY'} />
          </Label>
          <H4>{strategyAPY.displayValue}</H4>
        </Box>
        <Box>
          <Label>
            <FormattedMessage defaultMessage={'Leverage Ratio'} />
          </Label>
          <H4>{leverageRatio}</H4>
        </Box>
      </ApyContainer>
      <ButtonContainer>
        <ButtonBar
          buttonOptions={buttonData}
          sx={{
            height: theme.spacing(5),
          }}
        />
        {routes.txnHistory && (
          <ActionRowButton
            variant="outlined"
            size="medium"
            {...defineMessages({
              label: {
                defaultMessage: 'Transaction History',
                description: 'button text',
              },
            })}
            route={routes.txnHistory}
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
