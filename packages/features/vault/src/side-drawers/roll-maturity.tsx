import { VaultSideDrawer } from '../components';
import { useVaultActionErrors } from '../hooks';
import { ErrorMessage } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';

export const RollMaturity = observer(() => {
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
});
