import { useEffect } from 'react';
import { FeatureLoader } from '@notional-finance/mui';
import { LendSideBarLayout } from './lend-side-bar-layout';
import { useParams } from 'react-router-dom';
import { useNotional } from '@notional-finance/notionable-hooks';
import { useLend } from './store/use-lend';
import { updateLendState } from './store/lend-store';

export const LendFeatureShell = () => {
  const { currency } = useParams<Record<string, string>>();
  useEffect(() => {
    if (currency)
      updateLendState({ selectedToken: currency, selectedMarketKey: '' });
  }, [currency]);

  const { system } = useNotional();
  const { markets, maturityData, availableCurrencies, selectedToken } =
    useLend();

  const featureLoaded =
    system &&
    currency &&
    selectedToken &&
    markets.length > 0 &&
    maturityData.length > 0 &&
    availableCurrencies.length > 0
      ? true
      : false;

  return (
    <FeatureLoader featureLoaded={featureLoaded}>
      <LendSideBarLayout />
    </FeatureLoader>
  );
};

export default LendFeatureShell;
