import { Divider, styled, useTheme } from '@mui/material';
import { ExternalLink, HeadingSubtitle, Drawer } from '@notional-finance/mui';
import {
  BaseContext,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { useCallback, useContext } from 'react';
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
  const { state, updateState } = useContext(context);
  const { populatedTransaction, transactionError } = state;
  // const selectedNetwork = useSelectedNetwork();
  // const [_calls, setSimulatedCalls] = useState<
  //   SimulationCallTrace[] | undefined
  // >();
  // const [_logs, setSimulatedLogs] = useState<ParsedLogs | undefined>();
  const onTxnCancel = useCallback(
    () => updateState({ confirm: false }),
    [updateState]
  );

  const { isReadOnlyAddress, transactionStatus, transactionHash, onSubmit } =
    useTransactionStatus();

  // const runSimulate = useCallback(async () => {
  //   if (!selectedNetwork || !populatedTransaction) return;

  //   try {
  //     const { simulatedCalls, simulatedLogs } = await simulatePopulatedTxn(
  //       selectedNetwork,
  //       populatedTransaction
  //     );
  //     setSimulatedCalls(simulatedCalls);
  //     setSimulatedLogs(simulatedLogs);
  //     console.log(simulatedCalls);
  //     console.log(simulatedLogs);
  //   } catch (e) {
  //     console.error(e);
  //     setSimulatedCalls(undefined);
  //     setSimulatedLogs(undefined);
  //   }
  // }, [populatedTransaction, selectedNetwork]);

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
      {/* <Button onClick={runSimulate}>Simulate</Button> */}
      <OrderDetails state={state} />
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
