import { Registry } from "@notional-finance/core-entities";

export type NoteSupplyData = {
    day: Date;
    address: "Burned" | "Circulating Supply" | "Non-Circulating";
    balance: number;
}[] 

export function useNoteSupply() {
    let result: NoteSupplyData | [] = []
    console.log("useNoteSupply")
    try {
      Registry.getNOTERegistry()
      .getNOTESupplyData()
      .then((resp: NoteSupplyData) =>
        {
          console.log({resp})
          result = resp
        }
      );
      return result;
    } catch(error) {
      console.log("useNoteSupply error: ", error)
      return undefined;
    }
  }