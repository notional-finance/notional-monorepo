import { getNetworkModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useObserver } from 'mobx-react-lite';
import { useFetchAnalyticsData } from './use-market';

export type NoteSupplyData = {
  day: Date;
  address: 'Burned' | 'Circulating Supply' | 'Non-Circulating';
  balance: number;
}[];

export type StakedNoteData = {
  day: Date;
  total_pool_value: number | null;
  snote_supply: number | null;
  price: number | null;
  apy: number | null;
}[];

export function useNoteSupplyData() {
  const noteSupplyData = useObserver(() => {
    const model = getNetworkModel(Network.mainnet);
    return model.getNoteSupply();
  });
  useFetchAnalyticsData('noteSupply', !!noteSupplyData, Network.mainnet);
  return noteSupplyData || [];
}

export function useStakedNoteData() {
  const model = getNetworkModel(Network.mainnet);
  const snoteData = model.getSNOTEData();
  useFetchAnalyticsData('sNOTEData', !!snoteData, Network.mainnet);
  return snoteData || [];
}
