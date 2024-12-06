import { VaultSideDrawer } from '../components';
import { useVaultActionErrors } from '../hooks';
import { ErrorMessage } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const RollMaturity = () => {
  const { leverageRatioError, inputErrorMsg } = useVaultActionErrors();

  return (
    <VaultSideDrawer>
      {leverageRatioError && (
        <ErrorMessage
          variant="error"
          message={<FormattedMessage {...leverageRatioError} />}
        />
      )}
      {inputErrorMsg && (
        <ErrorMessage
          variant="error"
          message={<FormattedMessage {...inputErrorMsg} />}
        />
      )}
    </VaultSideDrawer>
  );
};
