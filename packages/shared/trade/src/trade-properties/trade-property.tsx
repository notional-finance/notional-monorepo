import { LabeledText } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { PropertyFormatters, PropertyMessages, TradePropertyKeys } from '.';
import { TokenBalance } from '@notional-finance/core-entities';

interface TradePropertyProps {
  propertyKey: TradePropertyKeys;
  value?: number | TokenBalance | string;
  labelAbove?: boolean;
}

export const TradeProperty = ({
  propertyKey,
  value,
  labelAbove = false,
}: TradePropertyProps) => {
  if (value) {
    return (
      <LabeledText
        label={<FormattedMessage {...PropertyMessages[propertyKey]} />}
        value={PropertyFormatters[propertyKey](value)}
        labelAbove={labelAbove}
      />
    );
  }
  return null;
};
