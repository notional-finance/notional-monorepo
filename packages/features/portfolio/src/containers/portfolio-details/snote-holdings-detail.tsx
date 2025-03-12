import { observer } from 'mobx-react-lite';
import { usePortfolioSNOTETable } from '../../hooks';
import PortfolioDetail from '../../components/portfolio-detail/portfolio-detail';

interface SNoteHoldingsDetailProps {
  value?: ReturnType<typeof usePortfolioSNOTETable>['data'][number];
}

const SNoteHoldingsDetail: React.FC<SNoteHoldingsDetailProps> = ({ value }) => {
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
        label: value.marketApy,
      }}
      contentSections={[
        {
          title: 'Earnings Summary',
          rows: [
            {
              label: 'NOTE Value',
              value: {
                text: value.noteValue.data?.[0]?.displayValue,
              },
              caption: value.noteValue.data?.[1]?.displayValue,
            },
            {
              label: 'Total Value',
              value: {
                text: value.totalValue,
              },
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

export default observer(SNoteHoldingsDetail);
