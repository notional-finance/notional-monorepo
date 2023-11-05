import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
} from '@notional-finance/mui';
import {
  TradeContext,
  useLeverageBlock,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import { useInputAmount } from '../common';
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
import { useLocation } from 'react-router-dom';
import { LiquidationRisk } from './components/liquidation-risk';
import { TradeSummary } from './components/trade-summary';
import { EnablePrimeBorrow } from '../enable-prime-borrow/enable-prime-borrow';
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
  context: TradeContext;
  leveredUp?: boolean;
  children?: React.ReactNode;
  advancedToggle?: ToggleSwitchProps;
  isPortfolio?: boolean;
  showDrawer?: boolean;
  enablePrimeBorrow?: boolean;
  riskComponent?: React.ReactNode;
  handleLeverUpToggle?: () => void;
  onReturnToForm?: () => void;
  onConfirmCancel?: () => void;
  onCancelCallback?: () => void;
  isWithdraw?: boolean;
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
  enablePrimeBorrow,
  riskComponent,
  onReturnToForm,
  onCancelCallback,
  isWithdraw = false,
}: TransactionSidebarProps) => {
  const { state, updateState } = context;
  const { pathname } = useLocation();
  const {
    selectedDepositToken,
    canSubmit,
    confirm,
    tradeType,
    debt,
    collateral,
  } = state;
  const isBlocked = useLeverageBlock();
  const handleSubmit = useCallback(() => {
    updateState({ confirm: true });
  }, [updateState]);

  const onConfirmCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  const { token, inputAmount } = useInputAmount(
    '0.00000001',
    selectedDepositToken
  );

  const { insufficientAllowance } = useWalletBalanceInputCheck(
    token,
    inputAmount
  );

  // TODO Show token approval component if isWithdraw is false and insufficientAllowance is true

  console.log({ insufficientAllowance });

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

  return confirm ? (
    <TransactionConfirmation
      heading={heading && <FormattedMessage {...heading} />}
      context={context}
      showApprovals={isWithdraw ? false : insufficientAllowance}
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
      onCancelCallback={onCancelCallback}
      leveredUp={leveredUp || false}
      showLeverUpToggle={!pathname.includes('lend')}
      leverageDisabled={leverageDisabled}
      showDrawer={isPortfolio ? false : showDrawer === true}
      hideTextOnMobile={isPortfolio ? false : true}
    >
      {children}
      {riskComponent || <LiquidationRisk state={state} />}
      <TradeSummary state={state} />
      {enablePrimeBorrow && <EnablePrimeBorrow />}
    </ActionSidebar>
  );
};
