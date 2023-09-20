import {
  ActionSidebar,
  PageLoading,
  ToggleSwitchProps,
} from '@notional-finance/mui';
import { TradeContext } from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import { MessageDescriptor, defineMessages } from 'react-intl';
import { useGeoipBlock } from '@notional-finance/helpers';
import TradeActionButton from '../trade-action-button/trade-action-button';
import Confirmation2 from '../transaction-confirmation/confirmation2';
import {
  TransactionHeadings,
  CombinedTokenTypes,
} from './components/transaction-headings';
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
  onReturnToForm,
  onCancelCallback,
}: TransactionSidebarProps) => {
  const { state, updateState } = context;
  const { canSubmit, confirm, tradeType, debt, collateral } = state;
  const isBlocked = useGeoipBlock();
  const handleSubmit = useCallback(() => {
    updateState({ confirm: true });
  }, [updateState]);

  const onConfirmCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  if (tradeType === undefined) return <PageLoading />;

  const leverageDisabled = isBlocked && tradeType.includes('Leveraged');
  const errorMessage = defineMessages({
    geoErrorHeading: {
      defaultMessage: 'Leveraged products are not available in the US',
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
      heading={heading}
      context={context}
      showDrawer={isPortfolio ? false : true}
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
      showDrawer={isPortfolio ? false : true}
      hideTextOnMobile={isPortfolio ? false : true}
    >
      {children}
      <LiquidationRisk state={state} />
      <TradeSummary state={state} />
    </ActionSidebar>
  );
};
