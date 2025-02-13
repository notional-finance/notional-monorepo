import { useAppStore } from '@notional-finance/notionable-hooks';
import { useDetailedHoldingsTable } from '../portfolio-holdings/use-detailed-holdings';
import { useMemo } from 'react';
import {
  usePortfolioNOTETable,
  usePortfolioSNOTETable,
  useVaultHoldingsTable,
} from '@notional-finance/portfolio-feature-shell/hooks';
import PortfolioHoldingsDetail from './portfolio-holdings-detail';
import VaultHoldingsDetail from './vault-holdings-detail';
import NoteHoldingsDetail from './note-holdings-detail';
import SNoteHoldingsDetail from './snote-holdings-detail';

interface PortfolioDetailsProps {
  selectedToken: string;
}

const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  selectedToken,
}) => {
  const { baseCurrency } = useAppStore();
  const { detailedHoldings } = useDetailedHoldingsTable(baseCurrency);
  const { vaultHoldingsData } = useVaultHoldingsTable();
  const { noteData } = usePortfolioNOTETable();
  const { data: sNoteData } = usePortfolioSNOTETable();

  const selectedHolding = useMemo(
    () => detailedHoldings.find((holding) => holding.tokenId === selectedToken),
    [detailedHoldings, selectedToken, baseCurrency]
  );

  const selectedVaultHolding = useMemo(
    () =>
      vaultHoldingsData.find(
        (holding) => holding.vault.symbol === selectedToken
      ),
    [vaultHoldingsData, selectedToken]
  );

  const selectedNoteHolding = useMemo(
    () => noteData.find((holding) => holding.asset.symbol === selectedToken),
    [noteData, selectedToken]
  );

  const selectedSNoteHolding = useMemo(
    () => sNoteData.find((holding) => holding.asset.symbol === selectedToken),
    [sNoteData, selectedToken]
  );

  return selectedHolding ? (
    <PortfolioHoldingsDetail value={selectedHolding} />
  ) : selectedVaultHolding ? (
    <VaultHoldingsDetail value={selectedVaultHolding} />
  ) : selectedNoteHolding ? (
    <NoteHoldingsDetail value={selectedNoteHolding} />
  ) : selectedSNoteHolding ? (
    <SNoteHoldingsDetail value={selectedSNoteHolding} />
  ) : null;
};

export default PortfolioDetails;
