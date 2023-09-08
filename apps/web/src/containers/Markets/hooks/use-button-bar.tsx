import { FormattedMessage } from 'react-intl';
import { ButtonOptionsType } from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/util';

export const useButtonBar = (setMarketType, marketType) => {
  const buttonData: ButtonOptionsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Earn Yield'} />,
      callback: () => setMarketType(MARKET_TYPE.EARN),
      active: marketType === MARKET_TYPE.EARN,
    },
    {
      buttonText: <FormattedMessage defaultMessage={'Borrow'} />,
      callback: () => setMarketType(MARKET_TYPE.BORROW),
      active: marketType === MARKET_TYPE.BORROW,
    },
  ];

  return buttonData;
};

export default useButtonBar;
