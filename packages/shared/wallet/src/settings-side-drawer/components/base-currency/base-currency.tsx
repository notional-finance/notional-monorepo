// import { useCallback } from 'react';
// import { Box, styled, useTheme } from '@mui/material';
import { Box, styled } from '@mui/material';
import { LabelValue, SideDrawerActiveButton } from '@notional-finance/mui';
// import {
//   setInLocalStorage,
//   getFromLocalStorage,
// } from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { useBaseCurrency } from './use-base-currency';

export const BaseCurrency = () => {
  const currencyOptions = useBaseCurrency();
  console.log({ currencyOptions });
  // const defaultKey = userSettings?.language
  //   ? userSettings.language
  //   : navigator.language;

  // const handleConnect = useCallback(
  //   (key: string) => {
  //     setInLocalStorage('userSettings', { ...userSettings, language: key });
  //     window.location.reload();
  //   },
  //   [userSettings]
  // );

  const handleConnect = (key) => {
    console.log({ key });
  };

  return (
    <WalletSelectorContainer>
      <Title>
        <FormattedMessage defaultMessage="Base Currency" />
      </Title>
      {currencyOptions.map(({ label, Icon, key }, index) => (
        <SideDrawerActiveButton
          label={label}
          Icon={Icon}
          dataKey={key}
          key={index}
          callback={handleConnect}
          selectedKey={'USD'}
        />
      ))}
    </WalletSelectorContainer>
  );
};

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

const WalletSelectorContainer = styled(Box)(
  ({ theme }) => `
  margin: 0px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  background: ${theme.palette.background.paper};
  `
);

export default BaseCurrency;
