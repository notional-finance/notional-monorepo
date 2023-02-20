import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import { PopulatedTransaction, ethers } from 'ethers';
import { styled, Divider, useTheme } from '@mui/material';
import { Drawer, ExternalLink, HeadingSubtitle } from '@notional-finance/mui';
import { Account } from '@notional-finance/sdk';
import { useAccount, useNotional } from '@notional-finance/notionable-hooks';
import { trackEvent, logError } from '@notional-finance/helpers';
import { PendingTransaction } from './components/pending-transaction';
import { TransactionStatus } from './components/transaction-status';
import { TransactionButtons } from './components/transaction-buttons';
import { StatusHeading } from './components/status-heading';
import { TradeProperties } from '../trade-properties';
import { TradePropertiesGrid } from '../trade-properties/trade-properties-grid';

export interface TransactionFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionFn: (...args: any) => Promise<PopulatedTransaction>;
  transactionArgs: unknown[];
}

export interface TransactionData {
  transactionHeader: string;
  transactionProperties: TradeProperties;
  buildTransactionCall: TransactionFunction;
}

export interface TransactionConfirmationProps {
  heading: React.ReactNode;
  onCancel: () => void;
  transactionProperties: TradeProperties;
  buildTransactionCall: TransactionFunction;
  onTxnConfirm?: (receipt: ethers.providers.TransactionReceipt) => void;
  showDrawer?: boolean;
  onReturnToForm?: () => void;
}

export const TransactionConfirmation = ({
  heading,
  transactionProperties,
  onCancel,
  buildTransactionCall,
  onTxnConfirm,
  onReturnToForm,
  showDrawer = true,
}: TransactionConfirmationProps) => {
  const theme = useTheme();
  const { account } = useAccount();
  const { notional } = useNotional();
  const { pathname } = useLocation();
  const [transactionToSubmit, setTransactionToSubmit] = useState<
    PopulatedTransaction | undefined
  >();
  const [pendingTransaction, setPendingTransaction] = useState<
    ethers.providers.TransactionResponse | undefined
  >();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.NONE
  );

  useEffect(() => {
    if (transactionStatus !== TransactionStatus.NONE) return;

    const { transactionFn, transactionArgs } = buildTransactionCall;
    // On mount scroll to the top and issue an async call to get the transaction
    // to submit and gas costs
    window.scrollTo(0, 0);

    if (!!notional && !!transactionFn && !!transactionArgs) {
      // Builds a populated transaction object for the user to sign
      transactionFn
        .apply(notional, transactionArgs)
        .then((t) => {
          setTransactionToSubmit(t);
          setTransactionStatus(TransactionStatus.BUILT);
        })
        .catch((e) => {
          logError(
            e,
            'shared/web/TransactionConfirmation',
            'build-transaction-effect',
            {
              transactionFn,
              transactionArgs,
            }
          );
          setTransactionStatus(TransactionStatus.ERROR_BUILDING);
        });
    }
  }, [notional, buildTransactionCall, transactionStatus]);

  useEffect(() => {
    let cancelWait;

    // If a transaction is pending, wait for confirmation and then set the appropriate status
    if (pendingTransaction) {
      new Promise<void>((resolve, reject) => {
        // Cancel wait is returned from the useEffect to clean up the waiting promise
        // if the user unmounts the view before the txn completes
        cancelWait = () => {
          setPendingTransaction(undefined);
          resolve();
        };

        Promise.resolve(
          pendingTransaction
            .wait()
            .then((receipt) => {
              // Allow for custom hooks when a transaction is confirmed to update parts of account
              // state
              if (onTxnConfirm) onTxnConfirm(receipt);
              setTransactionStatus(TransactionStatus.CONFIRMED);
            })
            .catch(() => {
              setTransactionStatus(TransactionStatus.REVERT);
            })
        )
          .then(resolve)
          .catch(reject);
      });
    }

    return cancelWait;
  }, [pendingTransaction, onTxnConfirm]);

  const onSubmit = () => {
    if (transactionToSubmit) {
      if (account) {
        (account as Account)
          .sendTransaction(transactionToSubmit)
          .then((p) => {
            setTransactionStatus(TransactionStatus.PENDING);
            setPendingTransaction(p);
            // Dispatches an event for tracking purposes
            // Clear the transaction to submit if the user does it
            trackEvent('CONFIRM_TXN', { url: pathname });
            setTransactionToSubmit(undefined);
          })
          .catch(() => {
            // If we see an error here it is most likely due to user rejection
            setTransactionStatus(TransactionStatus.USER_REJECT);
          });
      }
    }
  };

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
      <TradePropertiesGrid data={transactionProperties} />
      {pendingTransaction ? (
        <PendingTransaction
          hash={pendingTransaction.hash}
          transactionStatus={transactionStatus}
        />
      ) : null}
      <TransactionButtons
        transactionStatus={transactionStatus}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onReturnToForm={onReturnToForm}
        isLoaded={transactionToSubmit !== null}
      />
    </>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};

const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: ${theme.palette.borders.accentPaper};
`
);

export default TransactionConfirmation;
