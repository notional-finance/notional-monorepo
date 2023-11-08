import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
} from '@notional-finance/mui';
import {
  VaultContext,
  TradeContext,
  useLeverageBlock,
} from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useState } from 'react';
import {
  FormattedMessage,
  MessageDescriptor,
  defineMessages,
} from 'react-intl';
import TradeActionButton from '../trade-action-button/trade-action-button';
import TransactionConfirmation from '../transaction-confirmation/transaction-confirmation';
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
  leveredUp?: boolean;
  children?: React.ReactNode;
  advancedToggle?: ToggleSwitchProps;
  isPortfolio?: boolean;
  showDrawer?: boolean;
  riskComponent?: React.ReactNode;
  handleLeverUpToggle?: () => void;
  onReturnToForm?: () => void;
  onConfirmCancel?: () => void;
  onCancelCallback?: () => void;
  onCancelRouteCallback?: () => void;
  isWithdraw?: boolean;
  hideTextOnMobile?: boolean;
}

export const TransactionSidebar = ({
  context,
  heading,
  helptext,
  handleLeverUpToggle,
  children,
  leveredUp,
  advancedToggle,
  isPortfolio,
  showDrawer,
  riskComponent,
  onReturnToForm,
  onCancelCallback,
  onCancelRouteCallback,
  isWithdraw = false,
  hideTextOnMobile,
}: TransactionSidebarProps) => {
  const { state, updateState } = context;
  const { pathname } = useLocation();
  const [showTxnApprovals, setShowTxnApprovals] = useState(false);
  const {
    canSubmit,
    confirm,
    tradeType,
    debt,
    collateral,
    selectedDepositToken,
  } = state;
  const isBlocked = useLeverageBlock();
  const { showApprovals } = useTransactionApprovals(
    selectedDepositToken || '',
    context,
    isWithdraw
  );

  const handleSubmit = useCallback(() => {
    if (showApprovals) {
      setShowTxnApprovals(true);
    } else {
      updateState({ confirm: true });
    }
  }, [updateState, showApprovals]);

  const onConfirmCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  useEffect(() => {
    if (!showApprovals && showTxnApprovals) {
      setShowTxnApprovals(false);
      updateState({ confirm: true });
    }
  }, [showApprovals, showTxnApprovals, updateState]);

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
    if (debt?.tokenType && collateral?.tokenType) {
      const CombinedTokenType =
        `${debt?.tokenType}-${collateral?.tokenType}` as CombinedTokenTypes;
      return TransactionHeadings[tradeType][CombinedTokenType]
        ? TransactionHeadings[tradeType][CombinedTokenType]
        : undefined;
    } else {
      return undefined;
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

  return showTxnApprovals ? (
    <TransactionApprovals
      context={context}
      onCancel={() => setShowTxnApprovals(false)}
      showDrawer={isPortfolio ? false : showDrawer === true}
    />
  ) : confirm ? (
    <TransactionConfirmation
      heading={heading && <FormattedMessage {...heading} />}
      context={context}
      isWithdraw={isWithdraw}
      showDrawer={isPortfolio ? false : showDrawer === true}
      onReturnToForm={onReturnToForm}
      onCancel={onConfirmCancel}
    />
  ) : (
    <ActionSidebar
      heading={heading || TransactionHeadings[tradeType].heading}
      helptext={
        leverageDisabled
          ? errorMessage.geoErrorHeading
          : helptext ||
            getTokenSpecificHelpText() ||
            TransactionHeadings[tradeType].helptext
      }
      advancedToggle={advancedToggle}
      CustomActionButton={isPortfolio ? undefined : TradeActionButton}
      handleSubmit={handleSubmit}
      canSubmit={canSubmit && !leverageDisabled}
      handleLeverUpToggle={handleLeverUpToggle}
      onCancelCallback={handleActionSidebarCancel}
      leveredUp={leveredUp || false}
      showLeverUpToggle={!pathname.includes('lend')}
      leverageDisabled={leverageDisabled}
      showDrawer={isPortfolio ? false : showDrawer === true}
      hideTextOnMobile={isPortfolio || !hideTextOnMobile ? false : true}
    >
      {children}
      {riskComponent && riskComponent}
      <TradeSummary state={state} />
    </ActionSidebar>
  );
};
