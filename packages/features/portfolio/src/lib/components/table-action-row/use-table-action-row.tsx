import { PORTFOLIO_CATEGORIES } from '@notional-finance/utils';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';

interface TableActionRowData {
  actionLabel?: MessageDescriptor;
  toolTip?: MessageDescriptor;
}

export const useTableActionRow = () => {
  const { category } = useParams<PortfolioParams>();

  const configData = {
    [PORTFOLIO_CATEGORIES.BORROWS]: defineMessages({
      actionLabel: {
        defaultMessage: 'Repay Borrow',
        description: 'button text',
      },
      toolTip: {
        defaultMessage: 'Deposit cash to repay your debt prior to maturity.',
        description: 'tooltip text',
      },
    }),
    [PORTFOLIO_CATEGORIES.LENDS]: defineMessages({
      actionLabel: {
        defaultMessage: 'Withdraw Lend',
        description: 'button text',
      },
      toolTip: {
        defaultMessage: 'Withdraw your lending position prior to maturity for cash.',
        description: 'tooltip text',
      },
    }),
  } as Record<PORTFOLIO_CATEGORIES, TableActionRowData>;

  return category ? configData[category] : {};
};
