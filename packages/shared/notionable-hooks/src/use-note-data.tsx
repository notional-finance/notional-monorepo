import { getNetworkModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useEffect } from 'react';

export type NoteSupplyData = {
  day: Date;
  address: 'Burned' | 'Circulating Supply' | 'Non-Circulating';
  balance: number;
}[];

export type StakedNoteData = {
  day: Date;
  total_pool_value: number;
  snote_supply: number;
  price: number;
  apy: number;
}[];

export function useNoteSupplyData() {
  const noteSupplyData = useObserver(() => {
    const model = getNetworkModel(Network.mainnet);
    return model.getNoteSupply();
  });
  const isNoteSupplyLoaded = !!noteSupplyData;

  useEffect(() => {
    if (!isNoteSupplyLoaded)
      getNetworkModel(Network.mainnet).fetchAnalyticsData('noteSupply');
  }, [isNoteSupplyLoaded]);

  return noteSupplyData || [];
}

export function useStakedNoteData() {
  const snoteData = useObserver(() => {
    const model = getNetworkModel(Network.mainnet);
    return model.getSNOTEData();
  });
  const isSNOTEDataLoaded = !!snoteData;

  useEffect(() => {
    if (!isSNOTEDataLoaded)
      getNetworkModel(Network.mainnet).fetchAnalyticsData('sNOTEData');
  }, [isSNOTEDataLoaded]);

  return snoteData || [];
}
