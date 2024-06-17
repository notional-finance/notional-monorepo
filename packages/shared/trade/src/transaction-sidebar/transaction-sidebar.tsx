import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
  Drawer,
  ScrollToTop,
} from '@notional-finance/mui';
import {
  VaultContext,
  TradeContext,
  useLeverageBlock,
  useWalletConnectedNetwork,
  useReadOnlyAddress,
} from '@notional-finance/notionable-hooks';
import { TradeState } from '@notional-finance/notionable';
import { useCallback, useEffect, useState } from 'react';
import {
  FormattedMessage,
  MessageDescriptor,
  defineMessages,
} from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import TradeActionButton from '../trade-action-button/trade-action-button';
import TransactionConfirmation from '../transaction-confirmation/transaction-confirmation';
import { LiquidationRisk } from './components';
import {
  TransactionHeadings,
  CombinedTokenTypes,
} from './components/transaction-headings';
import { useTransactionApprovals } from '../transaction-approvals/hooks';
import { TransactionApprovals } from '../transaction-approvals/transaction-approvals';
import { useLocation } from 'react-router-dom';
import { TradeSummary } from './components/trade-summary';
import { isLeveragedTrade } from '@notional-finance/notionable';
import { PRODUCTS } from '@notional-finance/util';
import { SwitchNetwork } from '../transaction-approvals/switch-network';

interface TransactionSidebarProps {
  heading?:
    | MessageDescriptor
    | { defaultMessage: string }
    | { values?: Record<string, unknown> };
  helptext?:
    | MessageDescriptor
    | { defaultMessage: string }
    | { values?: Record<string, unknown> };
  context: TradeContext | VaultContext;
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
  variableBorrowRequired?: boolean;
  NetworkSelector?: React.ReactNode;
  mobileTopMargin?: string;
  hideActionButtons?: boolean;
}

export const TransactionSidebar = ({
  mobileTopMargin,
  context,
  heading,
  helptext,
  children,
  advancedToggle,
  isPortfolio,
  showDrawer = false,
  riskComponent,
  NetworkSelector,
  onReturnToForm,
  onCancelCallback,
  requiredApprovalAmount,
  onCancelRouteCallback,
  variableBorrowRequired,
  isWithdraw = false,
  hideTextOnMobile,
  hideActionButtons,
}: TransactionSidebarProps) => {
  const { state, updateState } = context;
  const { pathname } = useLocation();
  const [showTxnApprovals, setShowTxnApprovals] = useState(false);
  const [showSwitchNetwork, setShowSwitchNetwork] = useState(false);
  const { canSubmit, confirm, tradeType, debt, collateral, selectedNetwork } =
    state;
  const walletConnectedNetwork = useWalletConnectedNetwork();
  const isReadyOnlyWallet = useReadOnlyAddress();
  const isBlocked = useLeverageBlock();
  const approvalData = useTransactionApprovals(
    context,
    requiredApprovalAmount,
    variableBorrowRequired
  );
  const mustSwitchNetwork = selectedNetwork !== walletConnectedNetwork;

  const { showApprovals } = approvalData;

  const handleSubmit = useCallback(() => {
    if (mustSwitchNetwork && !isReadyOnlyWallet) {
      setShowSwitchNetwork(true);
    } else if (showApprovals && !isReadyOnlyWallet) {
      setShowTxnApprovals(true);
    } else {
      updateState({ confirm: true });
    }
  }, [updateState, showApprovals, mustSwitchNetwork, isReadyOnlyWallet]);

  const onConfirmCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  useEffect(() => {
    // NOTE: Triggers confirmations once all approvals are complete.
    if (!mustSwitchNetwork && showSwitchNetwork) {
      setShowSwitchNetwork(false);

      // If approvals are still required proceed to that stage
      if (showApprovals) {
        setShowTxnApprovals(true);
      } else {
        updateState({ confirm: true });
      }
    }

    if (!showApprovals && showTxnApprovals) {
      setShowTxnApprovals(false);
      updateState({ confirm: true });
    }
  }, [
    showApprovals,
    showTxnApprovals,
    mustSwitchNetwork,
    showSwitchNetwork,
    updateState,
  ]);

  if (tradeType === undefined) return <PageLoading />;

  const leverageDisabled =
    // Always allow users to withdraw
    tradeType === 'DeleverageWithdraw'
      ? false
      : isBlocked &&
        (isLeveragedTrade(tradeType) ||
          pathname.includes(PRODUCTS.LIQUIDITY_LEVERAGED));

  const errorMessage = defineMessages({
    geoErrorHeading: {
      defaultMessage:
        'Leveraged products are not available in the US or to VPN users. Non-Leveraged products are available to all users globally.',
    },
  });

  const getTokenSpecificHelpText = () => {
    if (leverageDisabled) {
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
      context={context}
      onCancel={() => setShowSwitchNetwork(false)}
    />
  ) : showTxnApprovals ? (
    <TransactionApprovals
      context={context}
      onCancel={() => setShowTxnApprovals(false)}
      {...approvalData}
    />
  ) : confirm ? (
    <TransactionConfirmation
      heading={heading && <FormattedMessage {...heading} />}
      context={context}
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
      canSubmit={canSubmit && !leverageDisabled}
      onCancelCallback={handleActionSidebarCancel}
      leverageDisabled={leverageDisabled}
      hideTextOnMobile={isPortfolio || !hideTextOnMobile ? false : true}
      NetworkSelector={NetworkSelector}
      hideActionButtons={hideActionButtons}
      isPortfolio={isPortfolio}
    >
      <ScrollToTop />
      {children}
      {riskComponent || <LiquidationRisk state={state as TradeState} />}
      {tradeType !== 'StakeNOTECoolDown' && <TradeSummary state={state} />}
    </ActionSidebar>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};
