import { Registry } from '@notional-finance/core-entities';
import { useEffect, useState } from 'react';

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
  const [supplyData, setSupplyData] = useState<NoteSupplyData | undefined>(
    undefined
  );

  useEffect(() => {
    Registry.getNOTERegistry()
      .getNOTESupplyData()
      .then((data) => setSupplyData(data))
      .catch((error) => {
        console.error('Error fetching note supply data:', error);
        setSupplyData(undefined);
      });
  }, []);

  return supplyData;
}

export function useStakedNoteData() {
  const [stakedNoteData, setStakedNoteData] = useState<
    StakedNoteData | undefined
  >(undefined);

  useEffect(() => {
    Registry.getNOTERegistry()
      .getSNOTEData()
      .then((data) => setStakedNoteData(data))
      .catch((error) => {
        console.error('Error fetching staked note data:', error);
        setStakedNoteData(undefined);
      });
  }, []);

  return stakedNoteData;
}
