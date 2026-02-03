import { observer } from 'mobx-react-lite';
import { usePortfolioNOTETable } from '../../hooks';
import PortfolioDetail from '../../components/portfolio-detail/portfolio-detail';

interface NoteHoldingsDetailProps {
  value?: ReturnType<typeof usePortfolioNOTETable>['noteData'][number];
}

const NoteHoldingsDetail: React.FC<NoteHoldingsDetailProps> = ({ value }) => {
  if (!value) {
    return null;
  }

  return (
    <PortfolioDetail
      token={{
        symbol: value.asset.symbol,
        label: value.asset.label,
        caption: value.asset.caption,
      }}
      header={{
        label: value.notePrice,
      }}
      contentSections={[
        {
          title: 'Earnings Summary',
          rows: [
            {
              label: 'NOTE Price',
              value: {
                text: value.notePrice,
              },
            },
            {
              label: 'Wallet Balance',
              value: {
                text: value.walletBalance.data?.[0]?.displayValue,
              },
              caption: value.walletBalance.data?.[1]?.displayValue,
            },
          ],
        },
        {
          title: 'Details',
          rows: value.actionRow.subRowData.map((row) => ({
            label: row.label,
            value: {
              text: row.value,
            },
          })),
        },
      ]}
    />
  );
};

export default observer(NoteHoldingsDetail);
