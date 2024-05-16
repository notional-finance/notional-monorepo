import { Registry } from '@notional-finance/core-entities';
import { useState } from 'react';

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

  if (supplyData !== undefined) return supplyData;

  try {
    Registry.getNOTERegistry()
      .getNOTESupplyData()
      .then((data) => setSupplyData(data));
    return supplyData;
  } catch (error) {
    return undefined;
  }
}

export function useStakedNoteData() {
  const [stakedNoteData, setStakedNoteData] = useState<
    StakedNoteData | undefined
  >(undefined);

  if (stakedNoteData !== undefined) return stakedNoteData;

  try {
    Registry.getNOTERegistry()
      .getSNOTEData()
      .then((data) => setStakedNoteData(data));
    return stakedNoteData;
  } catch (error) {
    return undefined;
  }
}
