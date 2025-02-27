import { useAppStore } from '@notional-finance/notionable-hooks';
import { useDetailedHoldingsTable } from '../portfolio-holdings/use-detailed-holdings';
import { useMemo } from 'react';
import { usePortfolioNOTETable, usePortfolioSNOTETable } from '../../hooks';
import PortfolioHoldingsDetail from './portfolio-holdings-detail';
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
  const { baseCurrency } = useAppStore();
  const { detailedHoldings } = useDetailedHoldingsTable(baseCurrency);
  const { vaultHoldingsData } = usePortfolioOverviewTable(false);
  const { noteData } = usePortfolioNOTETable();
  const { data: sNoteData } = usePortfolioSNOTETable();

  const selectedHolding = useMemo(
    () => detailedHoldings.find((holding) => holding.tokenId === selectedToken),
    [detailedHoldings, selectedToken]
  );

  const selectedVaultHolding = useMemo(
    () =>
      vaultHoldingsData.find(
        (holding) => holding.asset.symbol === selectedToken
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
