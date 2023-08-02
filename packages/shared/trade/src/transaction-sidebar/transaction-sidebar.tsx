import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
} from '@notional-finance/mui';
import { TradeContext } from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import { MessageDescriptor } from 'react-intl';
import TradeActionButton from '../trade-action-button/trade-action-button';
import Confirmation2 from '../transaction-confirmation/confirmation2';
import { TransactionHeadings } from './components/transaction-headings';
import { LiquidationRisk } from './components/liquidation-risk';
import { TradeSummary } from './components/trade-summary';

interface TransactionSidebarProps {
  heading?: MessageDescriptor;
  helptext?: MessageDescriptor;
  context: TradeContext;
  leveredUp?: boolean;
  children: React.ReactNode;
  advancedToggle?: ToggleSwitchProps;
  isPortfolio?: boolean;
  handleLeverUpToggle?: () => void;
  onReturnToForm?: () => void;
  onConfirmCancel?: () => void;
  onCancelCallback?: () => void;
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
  onConfirmCancel,
  onReturnToForm,
  onCancelCallback,
}: TransactionSidebarProps) => {
  const { state, updateState } = context;
  const { canSubmit, populatedTransaction, confirm, tradeType } = state;

  const handleSubmit = useCallback(() => {
    updateState({ confirm: true });
  }, [updateState]);

  if (tradeType === undefined) return <PageLoading />;

  return confirm && populatedTransaction ? (
    <Confirmation2
      heading={heading}
      context={context}
      showDrawer={isPortfolio ? false : true}
      onReturnToForm={onReturnToForm}
      onCancel={onConfirmCancel}
    />
  ) : (
    <ActionSidebar
      heading={heading || TransactionHeadings[tradeType].heading}
      helptext={helptext || TransactionHeadings[tradeType].helptext}
      advancedToggle={advancedToggle}
      CustomActionButton={isPortfolio ? undefined : TradeActionButton}
      handleSubmit={handleSubmit}
      canSubmit={canSubmit}
      handleLeverUpToggle={handleLeverUpToggle}
      onCancelCallback={onCancelCallback}
      leveredUp={leveredUp || false}
      showDrawer={isPortfolio ? false : true}
      hideTextOnMobile={isPortfolio ? false : true}
    >
      {children}
      <LiquidationRisk state={state} />
      <TradeSummary state={state} />
    </ActionSidebar>
  );
};
