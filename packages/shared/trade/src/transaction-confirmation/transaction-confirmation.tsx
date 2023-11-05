// import { styled } from '@mui/material';
// import { HeadingSubtitle, Drawer } from '@notional-finance/mui';
import { Drawer } from '@notional-finance/mui';
import {
  BaseTradeContext,
  TransactionStatus,
  useSelectedNetwork,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
// import { useCallback, useEffect } from 'react';
import { useEffect } from 'react';
import { StatusHeading, Confirmation } from './components';
import { trackEvent, RouteState } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router';

export interface TransactionConfirmationProps {
  heading: React.ReactNode;
  context: BaseTradeContext;
  onCancel?: () => void;
  onReturnToForm?: () => void;
  showDrawer?: boolean;
  showApprovals?: boolean;
}

export const TransactionConfirmation = ({
  heading,
  context,
  onCancel,
  onReturnToForm,
  showDrawer = true,
  showApprovals = false,
}: TransactionConfirmationProps) => {
  const { state } = context;
  const selectedNetwork = useSelectedNetwork();
  const location = useLocation<RouteState>();
  const { transactionError, tradeType } = state;

  // const onTxnCancel = useCallback(() => {
  //   updateState({ confirm: false });
  // }, [updateState]);

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

  // TODO: Look into bringing this back the confirmation stuff and handling the different states with TransactionStatus
  // Figure out when to display the withdraw approval in addition to the token approval

  const { transactionStatus } = useTransactionStatus();

  const inner = (
    <>
      <StatusHeading
        heading={heading}
        transactionStatus={
          transactionError
            ? TransactionStatus.ERROR_BUILDING
            : transactionStatus
        }
      />
      {showApprovals ? (
        <div>STUFF</div>
      ) : (
        <Confirmation
          context={context}
          onCancel={onCancel}
          onReturnToForm={onReturnToForm}
        />
      )}
    </>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};

export default TransactionConfirmation;
