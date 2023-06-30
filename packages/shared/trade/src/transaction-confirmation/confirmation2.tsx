import { Divider, styled, useTheme } from '@mui/material';
import {
  ExternalLink,
  HeadingSubtitle,
  Drawer,
  Button,
} from '@notional-finance/mui';
import {
  BaseContext,
  useSelectedNetwork,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import {
  ParsedLogs,
  simulatePopulatedTxn,
  SimulationCallTrace,
} from '@notional-finance/transaction';
import { useCallback, useContext, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  PendingTransaction,
  StatusHeading,
  TransactionButtons,
} from './components';

export interface ConfirmationProps {
  heading: React.ReactNode;
  context: BaseContext;
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
  const {
    state: { populatedTransaction, transactionError },
    updateState,
  } = useContext(context);
  const selectedNetwork = useSelectedNetwork();
  const onTxnCancel = useCallback(
    () => updateState({ confirm: false }),
    [updateState]
  );

  const { isReadOnlyAddress, transactionStatus, transactionHash, onSubmit } =
    useTransactionStatus();

  const [_calls, setSimulatedCalls] = useState<
    SimulationCallTrace[] | undefined
  >();
  const [_logs, setSimulatedLogs] = useState<ParsedLogs | undefined>();

  const runSimulate = useCallback(async () => {
    if (!selectedNetwork || !populatedTransaction) return;

    try {
      const { simulatedCalls, simulatedLogs } = await simulatePopulatedTxn(
        selectedNetwork,
        populatedTransaction
      );
      setSimulatedCalls(simulatedCalls);
      setSimulatedLogs(simulatedLogs);
      console.log(simulatedCalls);
      console.log(simulatedLogs);
    } catch (e) {
      console.error(e);
      setSimulatedCalls(undefined);
      setSimulatedLogs(undefined);
    }
  }, [populatedTransaction, selectedNetwork]);

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
      <Button onClick={runSimulate}>Simulate</Button>
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
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: ${theme.palette.borders.accentPaper};
`
);

export default Confirmation2;
