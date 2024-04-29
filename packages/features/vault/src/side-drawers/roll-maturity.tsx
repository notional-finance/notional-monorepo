import { VaultActionContext } from '../vault';
import { VaultSideDrawer } from '../components';
import { useContext } from 'react';
import { useVaultActionErrors } from '../hooks';
import { ErrorMessage } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const RollMaturity = () => {
  const context = useContext(VaultActionContext);
  const { leverageRatioError, inputErrorMsg } = useVaultActionErrors();

  return (
    <VaultSideDrawer context={context}>
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
