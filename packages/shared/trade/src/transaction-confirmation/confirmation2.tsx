import { Divider, styled, useTheme } from '@mui/material';
import { ExternalLink, HeadingSubtitle, Drawer } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePendingTransaction,
  useSubmitTransaction,
} from '@notional-finance/notionable-hooks';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import {
  PendingTransaction,
  StatusHeading,
  TransactionButtons,
  TransactionStatus,
} from './components';

export interface ConfirmationProps {
  heading: React.ReactNode;
  context: BaseTradeContext;
  onCancel: () => void;
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
  const {
    state: {
      populatedTransaction,
      transactionError,
      _simulatedCalls,
      _simulatedLogs,
    },
  } = useContext(context);
  const { pathname } = useLocation();

  const { isReadOnlyAddress, submitTransaction } = useSubmitTransaction();

  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.NONE
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const { transactionReceipt, reverted } =
    usePendingTransaction(transactionHash);

  useEffect(() => {
    if (reverted) setTransactionHash(TransactionStatus.REVERT);
    else if (transactionReceipt)
      setTransactionStatus(TransactionStatus.CONFIRMED);
  }, [transactionReceipt, reverted]);

  const onSubmit = () => {
    if (populatedTransaction && transactionError === undefined) {
      submitTransaction(populatedTransaction, pathname)
        .then((hash) => {
          setTransactionStatus(TransactionStatus.PENDING);
          setTransactionHash(hash);
        })
        .catch(() => {
          // If we see an error here it is most likely due to user rejection
          setTransactionStatus(TransactionStatus.USER_REJECT);
        });
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
      {/* <TradePropertiesGrid data={transactionProperties} /> */}
      {transactionHash && (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
        />
      )}
      <TransactionButtons
        transactionStatus={transactionStatus}
        onSubmit={onSubmit}
        onCancel={onCancel}
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
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: ${theme.palette.borders.accentPaper};
`
);

export default Confirmation2;
