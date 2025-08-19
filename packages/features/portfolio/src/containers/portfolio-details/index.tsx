import { useMemo } from 'react';
import { usePortfolioNOTETable, usePortfolioSNOTETable } from '../../hooks';
import VaultHoldingsDetail from './vault-holdings-detail';
import NoteHoldingsDetail from './note-holdings-detail';
import SNoteHoldingsDetail from './snote-holdings-detail';
import { usePortfolioOverviewTable } from '../portfolio-overview/hooks';
interface PortfolioDetailsProps {
  selectedToken: string;
}

const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  selectedToken,
}) => {
  const { vaultHoldingsData } = usePortfolioOverviewTable(false);
  const { noteData } = usePortfolioNOTETable();
  const { data: sNoteData } = usePortfolioSNOTETable();

  const selectedVaultHolding = useMemo(
    () =>
      vaultHoldingsData.find((holding) => holding.tokenId === selectedToken),
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

  return selectedVaultHolding ? (
    <VaultHoldingsDetail value={selectedVaultHolding} />
  ) : selectedNoteHolding ? (
    <NoteHoldingsDetail value={selectedNoteHolding} />
  ) : selectedSNoteHolding ? (
    <SNoteHoldingsDetail value={selectedSNoteHolding} />
  ) : null;
};

export default PortfolioDetails;
