import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
} from '@notional-finance/mui';
import {
  TradeContext,
  useLeverageBlock,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import {
  FormattedMessage,
  MessageDescriptor,
  defineMessages,
} from 'react-intl';
import TradeActionButton from '../trade-action-button/trade-action-button';
import Confirmation2 from '../transaction-confirmation/confirmation2';
import {
  TransactionHeadings,
  CombinedTokenTypes,
} from './components/transaction-headings';
import { LiquidationRisk } from './components/liquidation-risk';
import { TradeSummary } from './components/trade-summary';
import { EnablePrimeBorrow } from '../enable-prime-borrow/enable-prime-borrow';
import { isLeveragedTrade } from '@notional-finance/notionable';

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
}: TransactionSidebarProps) => {
  const { state, updateState } = context;
  const { canSubmit, confirm, tradeType, debt, collateral } = state;
  const isBlocked = useLeverageBlock();
  const handleSubmit = useCallback(() => {
    updateState({ confirm: true });
  }, [updateState]);

  const onConfirmCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  if (tradeType === undefined) return <PageLoading />;

  const leverageDisabled = isBlocked && isLeveragedTrade(tradeType);
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
    <Confirmation2
      heading={heading && <FormattedMessage {...heading} />}
      context={context}
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
