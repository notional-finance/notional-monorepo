import { Divider, styled, useTheme, Box } from '@mui/material';
import {
  ExternalLink,
  HeadingSubtitle,
  Drawer,
  ErrorMessage,
} from '@notional-finance/mui';
import {
  BaseTradeContext,
  TransactionStatus,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  PendingTransaction,
  StatusHeading,
  TransactionButtons,
} from './components';
import { OrderDetails } from './components/order-details';
import { PortfolioCompare } from './components/portfolio-compare';

export interface ConfirmationProps {
  heading: React.ReactNode;
  context: BaseTradeContext;
  onCancel?: () => void;
  onReturnToForm?: () => void;
  showDrawer?: boolean;
}

export const Confirmation2 = ({
  heading,
  context,
  onCancel,
  onReturnToForm,
  showDrawer = true,
}: ConfirmationProps) => {
  const theme = useTheme();
  const { state, updateState } = context;
  const { populatedTransaction, transactionError } = state;
  const onTxnCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  const { isReadOnlyAddress, transactionStatus, transactionHash, onSubmit } =
    useTransactionStatus();

  const inner = (
    <>
      <StatusHeading heading={heading} transactionStatus={transactionStatus} />
      <Divider variant="fullWidth" sx={{ background: 'white' }} />
      <TermsOfService theme={theme}>
        <FormattedMessage
          defaultMessage={
            'By submitting a trade on our platform you agree to our <a>terms of service.</a>'
          }
          values={{
            a: (msg: string) => (
              <ExternalLink
                href="/terms"
                style={{ color: theme.palette.primary.accent }}
              >
                {msg}
              </ExternalLink>
            ),
          }}
        />
      </TermsOfService>
      {transactionHash && (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
        />
      )}
      <OrderDetails state={state} />
      {transactionStatus === TransactionStatus.REVERT && (
        <Box sx={{ height: theme.spacing(8) }}>
          <ErrorMessage
            variant="error"
            message={
              transactionError ? (
                transactionError
              ) : (
                <FormattedMessage defaultMessage={'Transaction error'} />
              )
            }
          />
        </Box>
      )}
      <PortfolioCompare state={state} />
      <TransactionButtons
        transactionStatus={transactionStatus}
        onSubmit={() => onSubmit(populatedTransaction)}
        onCancel={onCancel || onTxnCancel}
        onReturnToForm={onReturnToForm}
        isReadyOnlyAddress={isReadOnlyAddress}
        isLoaded={
          populatedTransaction !== undefined && transactionError === undefined
        }
      />
    </>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};

const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
  margin-top: ${theme.spacing(2)};
  margin-bottom: ${theme.spacing(3)};
  color: ${theme.palette.borders.accentPaper};
`
);

export default Confirmation2;
