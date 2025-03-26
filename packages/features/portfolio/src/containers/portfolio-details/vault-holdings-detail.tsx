import { observer } from 'mobx-react-lite';
import PortfolioDetail from '../../components/portfolio-detail/portfolio-detail';
import { OverviewTableRow } from '../portfolio-overview/hooks';

interface VaultHoldingsDetailProps {
  value?: OverviewTableRow;
}

const VaultHoldingsDetail: React.FC<VaultHoldingsDetailProps> = ({ value }) => {
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
        label:
          typeof value.marketApy === 'string'
            ? value.marketApy
            : value.marketApy?.data?.[0]?.displayValue,
      }}
      contentSections={[
        {
          title: 'Earnings Summary',
          rows: [
            {
              label: 'Amount Paid',
              ...(typeof value.amountPaid === 'string'
                ? {
                    value: {
                      text: value.amountPaid,
                    },
                  }
                : {
                    value: {
                      text: value.amountPaid.data?.[0]?.displayValue,
                    },
                    caption: value.amountPaid.data?.[1]?.displayValue,
                  }),
            },
            {
              label: 'Present Value',
              ...(typeof value.presentValue === 'string'
                ? {
                    value: {
                      text: value.presentValue,
                    },
                  }
                : {
                    value: {
                      text: value.presentValue.data?.[0]?.displayValue,
                    },
                    caption: value.presentValue.data?.[1]?.displayValue,
                  }),
            },
            {
              label: 'Earnings',
              ...(typeof value.totalEarnings === 'string'
                ? {
                    value: {
                      text: value.totalEarnings,
                    },
                  }
                : {
                    value: {
                      text: value.totalEarnings.data?.[0]?.displayValue,
                      color: value.totalEarnings.data?.[0]?.textColor,
                    },
                    caption: value.totalEarnings.data?.[1]?.displayValue,
                  }),
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
      buttonData={value.actionRow.buttonBarData.map((button) => ({
        label: button.buttonText,
        link: button.link,
      }))}
    />
  );
};

export default observer(VaultHoldingsDetail);
