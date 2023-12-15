import { FormattedMessage, MessageDescriptor } from 'react-intl';

export const getErrorMessages = (
  errorMsgOverride: MessageDescriptor | undefined,
  errorMsg: MessageDescriptor | undefined,
  calculateError: string | undefined
) => {
  if (errorMsgOverride) {
    return <FormattedMessage {...errorMsgOverride} />;
  } else if (errorMsg) {
    return <FormattedMessage {...errorMsg} />;
  } else if (calculateError) {
    if (calculateError === 'Error: Insufficient Liquidity') {
      return (
        <FormattedMessage
          defaultMessage={
            'Insufficient Liquidity. Lower deposit amount, lower leverage, or switch to variable borrow rate to continue.'
          }
        />
      );
    } else if (calculateError.includes('code=NUMERIC_FAULT')) {
      return (
        <FormattedMessage
          defaultMessage={
            'Calculation error. Lower deposit amount to continue.'
          }
        />
      );
    } else if (calculateError === 'Error: Unable to converge: div by zero') {
      return (
        <FormattedMessage
          defaultMessage={
            'Calculation error. Increase deposit amount to continue.'
          }
        />
      );
    } else {
      return calculateError;
    }
  } else {
    return '';
  }
};

export default getErrorMessages;
