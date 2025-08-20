import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
  Drawer,
  ScrollToTop,
} from '@notional-finance/mui';
import {
  useLeverageBlock,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useState } from 'react';
import {
  FormattedMessage,
  MessageDescriptor,
  defineMessages,
} from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import { TradeActionButton } from '../trade-action-button/trade-action-button';
import TransactionConfirmation from '../transaction-confirmation/transaction-confirmation';
import {
  TransactionHeadings,
  CombinedTokenTypes,
} from './components/transaction-headings';
import {
  useChangeNetwork,
  useTransactionApprovals,
} from '../transaction-approvals/hooks';
import { TransactionApprovals } from '../transaction-approvals/transaction-approvals';
import { SwitchNetwork } from '../transaction-approvals/switch-network';
import { observer } from 'mobx-react-lite';

interface TransactionSidebarProps {
  heading?:
    | MessageDescriptor
    | { defaultMessage: string; values?: Record<string, any> };
  helptext?:
    | MessageDescriptor
    | { defaultMessage: string; values?: Record<string, any> };
  canSubmitOverride?: boolean;
  children?: React.ReactNode;
  advancedToggle?: ToggleSwitchProps;
  requiredApprovalAmount?: TokenBalance;
  isPortfolio?: boolean;
  showDrawer?: boolean;
  riskComponent?: React.ReactNode;
  onReturnToForm?: () => void;
  onConfirmCancel?: () => void;
  onCancelCallback?: () => void;
  onCancelRouteCallback?: () => void;
  isWithdraw?: boolean;
  hideTextOnMobile?: boolean;
  NetworkSelector?: React.ReactNode;
  mobileTopMargin?: string;
  hideActionButtons?: boolean;
}

const TransactionSidebarComponent = ({
  mobileTopMargin,
  heading,
  helptext,
  children,
  advancedToggle,
  isPortfolio,
  showDrawer = false,
  NetworkSelector,
  onReturnToForm,
  onCancelCallback,
  requiredApprovalAmount,
  onCancelRouteCallback,
  isWithdraw = false,
  hideTextOnMobile,
  hideActionButtons,
  canSubmitOverride = true,
}: TransactionSidebarProps) => {
  const trade = useCurrentTradeContext();
  const setConfirm = trade?.setConfirm;
  const [showTxnApprovals, setShowTxnApprovals] = useState(false);
  const [showSwitchNetwork, setShowSwitchNetwork] = useState(false);
  const canSubmit = canSubmitOverride ? trade?.canSubmit() || false : false;
  const confirm = trade?.confirm;
  const tradeType = trade?.tradeType;
  const selectedNetwork = trade?.selectedNetwork;
  const { debt, collateral } = trade?.selectedTokens ?? {};
  const { mustSwitchNetwork } = useChangeNetwork(selectedNetwork);
  const isBlocked = useLeverageBlock();
  const approvalData = useTransactionApprovals(requiredApprovalAmount);

  const { showApprovals } = approvalData;

  const handleSubmit = useCallback(() => {
    // Set the confirmation state up front to prevent the action sidebar
    // from re-rendering inside intermediate state updates.
    if (setConfirm) {
      setConfirm(true);
    }

    if (mustSwitchNetwork) {
      setShowSwitchNetwork(true);
    } else if (showApprovals) {
      setShowTxnApprovals(true);
    }
  }, [setConfirm, showApprovals, mustSwitchNetwork]);

  const onConfirmCancel = useCallback(() => {
    if (setConfirm) {
      setConfirm(false);
    }
  }, [setConfirm]);

  useEffect(() => {
    // NOTE: Triggers confirmations once all approvals are complete.
    if (!mustSwitchNetwork && showSwitchNetwork && setConfirm) {
      setShowSwitchNetwork(false);

      // If approvals are still required proceed to that stage
      if (showApprovals) {
        setShowTxnApprovals(true);
      } else {
        // Clear the populated transaction and transaction error to reset the simulation
        setConfirm(true);
      }
    }

    if (!showApprovals && showTxnApprovals && setConfirm) {
      setShowTxnApprovals(false);
      // Clear the populated transaction and transaction error to reset the simulation
      setConfirm(true);
    }
  }, [
    setConfirm,
    showApprovals,
    showTxnApprovals,
    mustSwitchNetwork,
    showSwitchNetwork,
  ]);

  if (tradeType === undefined) return <PageLoading />;

  const errorMessage = defineMessages({
    geoErrorHeading: {
      defaultMessage:
        'Leveraged products are not available in the US or to VPN users. Non-Leveraged products are available to all users globally.',
    },
  });

  const getTokenSpecificHelpText = () => {
    if (isBlocked) {
      return errorMessage.geoErrorHeading;
    } else if (helptext) {
      return helptext;
    } else if (debt?.tokenType && collateral?.tokenType) {
      const CombinedTokenType =
        `${debt?.tokenType}-${collateral?.tokenType}` as CombinedTokenTypes;
      return TransactionHeadings[tradeType][CombinedTokenType]
        ? TransactionHeadings[tradeType][CombinedTokenType]
        : TransactionHeadings[tradeType].helptext;
    } else {
      return TransactionHeadings[tradeType].helptext;
    }
  };

  const handleActionSidebarCancel = () => {
    if (onCancelCallback) {
      onCancelCallback();
    }
    if (onCancelRouteCallback) {
      onCancelRouteCallback();
    }
  };

  const inner = showSwitchNetwork ? (
    <SwitchNetwork
      selectedNetwork={selectedNetwork}
      onCancel={() => setShowSwitchNetwork(false)}
    />
  ) : showTxnApprovals ? (
    <TransactionApprovals
      onCancel={() => setShowTxnApprovals(false)}
      {...approvalData}
    />
  ) : confirm ? (
    <TransactionConfirmation
      heading={heading && <FormattedMessage {...heading} />}
      isWithdraw={isWithdraw}
      onReturnToForm={onReturnToForm}
      onCancel={onConfirmCancel}
    />
  ) : (
    <ActionSidebar
      mobileTopMargin={mobileTopMargin}
      heading={heading || TransactionHeadings[tradeType].heading}
      helptext={getTokenSpecificHelpText()}
      advancedToggle={advancedToggle}
      CustomActionButton={
        isPortfolio || hideActionButtons === true
          ? undefined
          : TradeActionButton
      }
      walletConnectedText={TransactionHeadings[tradeType].walletConnectedText}
      handleSubmit={handleSubmit}
      canSubmit={!!canSubmit && !isBlocked}
      onCancelCallback={handleActionSidebarCancel}
      leverageDisabled={isBlocked}
      hideTextOnMobile={isPortfolio || !hideTextOnMobile ? false : true}
      NetworkSelector={NetworkSelector}
      hideActionButtons={hideActionButtons}
      isPortfolio={isPortfolio}
    >
      <ScrollToTop />
      {children}
    </ActionSidebar>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};

export const TransactionSidebar = observer(TransactionSidebarComponent);
