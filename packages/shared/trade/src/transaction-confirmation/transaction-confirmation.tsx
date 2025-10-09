import { useCallback, useEffect, useState } from 'react';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS, TransactionStatus } from '@notional-finance/util';
import { Divider, styled, useTheme, Box } from '@mui/material';
import { useLocation } from 'react-router';
import {
  ExternalLink,
  HeadingSubtitle,
  ErrorMessage,
  ScrollToTop,
} from '@notional-finance/mui';
import {
  StatusHeading,
  TransactionButtons,
  OrderDetails,
  PendingTransaction,
} from './components';
import {
  useCurrentTradeContext,
  useSubmitTxn,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { PopulatedTransaction } from 'ethers';
import { observer } from 'mobx-react-lite';

export interface TransactionConfirmationProps {
  heading: React.ReactNode;
  onCancel?: () => void;
  onReturnToForm?: () => void;
  isWithdraw?: boolean;
}

export const TransactionConfirmation = observer(
  ({ heading, onCancel, onReturnToForm }: TransactionConfirmationProps) => {
    const theme = useTheme();
    const [p, setPopulatedTransaction] = useState<{
      populatedTransaction?: PopulatedTransaction;
      transactionError?: string;
    }>({
      populatedTransaction: undefined,
      transactionError: undefined,
    });
    const location = useLocation();
    const trade = useCurrentTradeContext();
    const submitTxn = useSubmitTxn();
    const tradeType = trade?.tradeType;
    const selectedNetwork = trade?.selectedNetwork;
    const {
      transactionStatus,
      transactionHash,
      userWallet,
      setTransactionStatus,
      setTransactionHash,
    } = useWalletStore();

    const onTxnCancel = useCallback(() => {
      trade?.clearTradeState();
    }, [trade]);

    useEffect(() => {
      return () => {
        setTransactionStatus(TransactionStatus.NONE);
        setTransactionHash('');
      };
    }, [setTransactionHash, setTransactionStatus]);

    useEffect(() => {
      if (
        trade &&
        p.populatedTransaction === undefined &&
        p.transactionError === undefined
      ) {
        trade.buildTransaction().then(setPopulatedTransaction);
      }
    }, [trade, p]);

    useEffect(() => {
      trackEvent(TRACKING_EVENTS.CONFIRMATION, {
        selectedNetwork,
        tradeType,
        path: location.pathname,
        routeType: location.state?.routeType || 'unknown',
      });
      // NOTE: only execute once on page load
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Box sx={{ minHeight: theme.spacing(162) }}>
        <ScrollToTop />
        <StatusHeading
          heading={heading}
          transactionStatus={
            p.transactionError
              ? TransactionStatus.ERROR_BUILDING
              : transactionStatus
          }
        />
        <TermsOfService theme={theme}>
          {transactionStatus === TransactionStatus.NONE && (
            <FormattedMessage
              defaultMessage={
                'By submitting a trade on our platform you agree to our <a>terms of service.</a>'
              }
              values={{
                a: (msg: React.ReactNode) => (
                  <ExternalLink
                    href="/terms"
                    style={{ color: theme.palette.primary.light }}
                  >
                    {msg}
                  </ExternalLink>
                ),
              }}
            />
          )}
          {transactionStatus === TransactionStatus.SUBMITTED && (
            <FormattedMessage
              defaultMessage={
                'You will be notified when the transaction is complete.'
              }
            />
          )}
        </TermsOfService>

        <Divider
          variant="fullWidth"
          sx={{ background: 'white', marginBottom: theme.spacing(6) }}
        />

        <OrderDetails />
        {transactionHash && (
          <PendingTransaction
            hash={transactionHash}
            transactionStatus={transactionStatus}
            selectedNetwork={selectedNetwork}
          />
        )}
        {(transactionStatus === TransactionStatus.REVERT ||
          p.transactionError) && (
          <Box sx={{ marginBottom: theme.spacing(6) }}>
            <ErrorMessage
              variant="error"
              marginBottom
              message={
                p.transactionError ? (
                  p.transactionError
                ) : (
                  <FormattedMessage defaultMessage={'Transaction Reverted'} />
                )
              }
            />
          </Box>
        )}
        {/* {simulationError && (
        <Box sx={{ marginBottom: theme.spacing(6) }}>
          <ErrorMessage
            variant="warning"
            marginBottom
            message={simulationError}
          />
        </Box>
      )} */}

        {trade?.redeemToWETH && (
          <Box sx={{ marginBottom: theme.spacing(6) }}>
            <ErrorMessage
              variant="info"
              marginBottom
              title={<FormattedMessage defaultMessage={'WETH Withdraw'} />}
              message={
                <FormattedMessage
                  defaultMessage={
                    'ETH will be wrapped to WETH before being sent to your wallet.'
                  }
                />
              }
            />
          </Box>
        )}
        <TransactionButtons
          network={selectedNetwork}
          transactionStatus={
            p.transactionError
              ? TransactionStatus.ERROR_BUILDING
              : transactionStatus
          }
          onSubmit={() =>
            p.populatedTransaction
              ? submitTxn(tradeType || 'unknown', p.populatedTransaction)
              : null
          }
          onCancel={() => {
            onTxnCancel();
            if (onCancel) onCancel();
          }}
          onReturnToForm={() => {
            onTxnCancel();
            if (onReturnToForm) onReturnToForm();
          }}
          isDisabled={userWallet?.isReadOnlyAddress || !!p.transactionError}
          isLoaded={p.populatedTransaction !== undefined}
        />
      </Box>
    );
  }
);

export const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    color: ${theme.palette.typography.light};
    font-size: 14px;
  `
);

export default TransactionConfirmation;
