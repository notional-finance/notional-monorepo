import { observer } from 'mobx-react-lite';
import { useDetailedHoldingsTable } from '../portfolio-holdings/use-detailed-holdings';
import PortfolioDetail from '../../components/portfolio-detail/portfolio-detail';

interface PortfolioHoldingsDetailProps {
  value?: ReturnType<
    typeof useDetailedHoldingsTable
  >['detailedHoldings'][number];
}

const PortfolioHoldingsDetail: React.FC<PortfolioHoldingsDetailProps> = ({
  value,
}) => {
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
        label: value.marketApy.data?.[0]?.displayValue,
        caption: value.marketApy.data?.[1]?.displayValue,
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
              ...(typeof value.earnings === 'string'
                ? {
                    value: {
                      text: value.earnings,
                    },
                  }
                : {
                    value: {
                      text: value.earnings.data?.[0]?.displayValue,
                    },
                    caption: value.earnings.data?.[1]?.displayValue,
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
      }))}
    />
  );
};

export default observer(PortfolioHoldingsDetail);
