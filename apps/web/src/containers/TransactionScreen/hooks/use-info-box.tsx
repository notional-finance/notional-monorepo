export const useInfoBox = () => {
  const tabs = [
    {
      tabTitle: 'Summary',
      contents: [
        {
          sectionTitle: 'Summary',
          items: [
            {
              label: 'Net Worth',
              content: '-',
            },
            {
              label: 'Health Factor',
              content: '-',
            },
            {
              label: 'Leverage Ratio',
              content: '-',
            },
            {
              label: 'Liquidation Price',
              content: '-',
            },
          ],
        },
        {
          sectionTitle: 'Estimated Earnings (30d)',
          items: [
            {
              label: 'Assets',
              content: '-',
            },
            {
              label: 'Borrow Interest',
              content: '-',
            },
            {
              label: 'Net Earnings',
              content: '-',
            },
          ],
        },
        {
          sectionTitle: 'Fees',
          items: [
            {
              label: 'Trading Costs',
              content: '-',
            },
          ],
        },
      ],
    },
    {
      tabTitle: 'APY Breakdown',
      contents: [
        {
          sectionTitle: 'Portfolio Impact',
          items: [],
        },
      ],
    },
    {
      tabTitle: 'Order Details',
      contents: [
        {
          sectionTitle: '',
          items: [
            {
              label: 'Amount Deposited',
              content: '-',
            },
            {
              label: 'Amount Borrowed',
              content: '-',
            },
            {
              label: 'Vault Shares Minted',
              content: '-',
            },
            {
              label: 'Vault Share Price',
              content: '-',
            },
          ],
        },
        {
          sectionTitle: 'Trade: USDC → USDT',
          items: [
            {
              label: 'Amount Sold',
              content: '-',
            },
            {
              label: 'Amount Bought',
              content: '-',
            },
            {
              label: 'Exchange Rate',
              content: '-',
            },
            {
              label: 'Fees',
              content: '-',
            },
          ],
        },
      ],
    },
  ];

  return tabs;
};
