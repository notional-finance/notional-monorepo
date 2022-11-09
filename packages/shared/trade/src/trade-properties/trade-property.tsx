import { LabeledText } from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { FormattedMessage } from 'react-intl';
import { PropertyFormatters, PropertyMessages, TradePropertyKeys } from '.';

interface TradePropertyProps {
  propertyKey: TradePropertyKeys;
  value?: number | TypedBigNumber | string;
  labelAbove?: boolean;
}

export const TradeProperty = ({ propertyKey, value, labelAbove = false }: TradePropertyProps) => {
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
