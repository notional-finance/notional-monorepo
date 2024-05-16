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
    try {
      Registry.getNOTERegistry()
        .getNOTESupplyData()
        .then((data) => setSupplyData(data));
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);
  return supplyData;
}

export function useStakedNoteData() {
  const [stakedNoteData, setStakedNoteData] = useState<
    StakedNoteData | undefined
  >(undefined);

  useEffect(() => {
    try {
      Registry.getNOTERegistry()
        .getSNOTEData()
        .then((data) => setStakedNoteData(data));
    } catch (error) {
      return undefined;
    }
  }, []);

  return stakedNoteData;
}
