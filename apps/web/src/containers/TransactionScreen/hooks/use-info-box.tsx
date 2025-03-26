export const useInfoBox = () => {
  const tabs = [
    {
      tabTitle: 'Summary',
      contents: [
        {
          sectionTitle: 'Account Summary',
          items: [
            {
              label: 'Collateral',
              content: '-',
            },
            {
              label: 'Debt',
              content: '-',
            },
            {
              label: 'Net Worth',
              content: '-',
            },
          ],
        },
        {
          sectionTitle: 'Order Details',
          items: [
            {
              label: 'Collateral',
              content: '-',
            },
            {
              label: 'Debt',
              content: '-',
            },
            {
              label: 'Net Worth',
              content: '-',
            },
          ],
        },
      ],
    },
    {
      tabTitle: 'Portfolio Impact',
      contents: [
        {
          sectionTitle: 'Portfolio Impact',
          items: [],
        },
      ],
    },
    {
      tabTitle: 'Portfolio Impact',
      contents: [
        {
          sectionTitle: 'Portfolio Impact',
          items: [],
        },
      ],
    },
  ];

  return tabs;
};
