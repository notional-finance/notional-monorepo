import { Dropdown } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';

export const StrategyTypeControl = () => {
  return (
    <Dropdown
      buttonText={defineMessage({
        defaultMessage: 'Strategy Type',
        description: 'Dropdown button text',
      })}
      dropDownItems={[
        { label: 'All Tokens', href: '/vaults-list' },
        { label: 'USDC', href: '/vaults-list/usdc' },
        { label: 'WETH', href: '/vaults-list/weth' },
      ]}
      open={false}
    />
  );
};
