'use client';
import { useEffect, useState } from 'react';
// material-ui
import Grid from '@mui/material/Grid';

// notional components
import { NestedList } from 'views/notional-components/nested-list';
import LayoutOutlined from '@ant-design/icons/LayoutOutlined';

import { capitalizeFirstLetter } from 'utils/notional-utils';

// assets
import IncomeOverviewCard from 'sections/dashboard/analytics/IncomeOverviewCard';
import { Box } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { ChartSubtitle, SharedH4 } from 'views/notional-components/shared-elements';

interface NestedListItem {
  id: string;
  icon: any;
  text: string;
  listItems?: NestedListItem[];
}

const nestedListItems: NestedListItem[] = [
  {
    id: 'variable_rate',
    icon: LayoutOutlined,
    text: 'Variable Rate',
    listItems: [
      {
        id: 'total_supplied',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Supplied'
      },
      {
        id: 'total_borrowed',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Borrowed'
      },
      {
        id: 'lend_rate',
        icon: undefined, // Add the desired icon for the child item
        text: 'Lend Rate'
      },
      {
        id: 'borrow_rate',
        icon: undefined, // Add the desired icon for the child item
        text: 'Borrow Rate'
      },
      {
        id: 'utilization',
        icon: undefined, // Add the desired icon for the child item
        text: 'Utilization'
      }
    ]
  },
  {
    id: 'fixed_rate_maturity_three_month',
    icon: LayoutOutlined,
    text: 'Fixed Rate (Sep 15, 2024)',
    listItems: [
      {
        id: 'total_supplied',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Supplied'
      },
      {
        id: 'total_debt',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Debt'
      },
      {
        id: 'oracle_rate',
        icon: undefined, // Add the desired icon for the child item
        text: 'Oracle Rate'
      },
      {
        id: 'fcash_price',
        icon: undefined, // Add the desired icon for the child item
        text: 'fCash Price'
      },
      {
        id: '30d_volumes',
        icon: undefined, // Add the desired icon for the child item
        text: '30d Volumes'
      }
    ]
  },
  {
    id: 'fixed_rate_maturity_six_month',
    icon: LayoutOutlined,
    text: 'Fixed Rate (Dec 15, 2024)',
    listItems: [
      {
        id: 'total_supplied',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Supplied'
      },
      {
        id: 'total_debt',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Debt'
      },
      {
        id: 'oracle_rate',
        icon: undefined, // Add the desired icon for the child item
        text: 'Oracle Rate'
      },
      {
        id: 'fcash_price',
        icon: undefined, // Add the desired icon for the child item
        text: 'fCash Price'
      },
      {
        id: '30d_volumes',
        icon: undefined, // Add the desired icon for the child item
        text: '30d Volumes'
      }
    ]
  },
  {
    id: 'liquidity',
    icon: LayoutOutlined,
    text: 'Liquidity',
    listItems: [
      {
        id: 'total_supply',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Supply'
      },
      {
        id: 'ntoken_apy',
        icon: undefined, // Add the desired icon for the child item
        text: 'nToken APY'
      },
      {
        id: 'ntoken_price',
        icon: undefined, // Add the desired icon for the child item
        text: 'nToken Price'
      },
      {
        id: 'utilization',
        icon: undefined, // Add the desired icon for the child item
        text: 'Utilization'
      }
    ]
  },
  {
    id: 'aura_wsteth_weth',
    icon: LayoutOutlined,
    text: 'Aura: wstETH/WETH',
    listItems: [
      {
        id: 'total_assets',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Assets'
      },
      {
        id: 'total_borrowed',
        icon: undefined, // Add the desired icon for the child item
        text: 'Total Borrowed'
      },
      {
        id: 'vault_share_apy',
        icon: undefined, // Add the desired icon for the child item
        text: 'Vault Share APY'
      },
      {
        id: 'vault_share_price',
        icon: undefined, // Add the desired icon for the child item
        text: 'Vault Share Price'
      }
    ]
  }
];

// TODO: add chart data to the child listItems and pass it to the chart when selected
// TODO: get the chart digesting the data and displaying it

export default function HistoricalMarketDataDefault({ token, network }: { token: string; network: string }) {
  const [open, setOpen] = useState<string | null>('variable_rate');
  const [childSelected, setChildSelected] = useState<string | null>('total_supplied');

  useEffect(() => {
    if (open === null) {
      setOpen('variable_rate');
      setChildSelected('total_supplied');
    }
  }, [open]);

  const selectedListItem = nestedListItems.find((listItem) => listItem.id === open);
  const selectedChildItem = selectedListItem?.listItems?.find((listItem) => listItem.id === childSelected);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} md={12} lg={12} sx={{ marginTop: '80px', display: 'flex', alignItems: 'center' }}>
        <TokenIcon symbol={token.toLocaleLowerCase()} size={'large'} style={{ marginRight: '16px' }} />
        <h1>
          {token} / {capitalizeFirstLetter(network)} Market
        </h1>
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item sx={{ marginBottom: '24px' }}>
            <SharedH4 sx={{ marginBottom: '0px', fontWeight: 500 }}>Historical Chart</SharedH4>
            <ChartSubtitle sx={{ textTransform: 'none' }}>
              Select the market to the right, then use the chart dropdown to choose a data-set from that market.
            </ChartSubtitle>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', background: 'white', padding: '24px', border: `1px solid #E7E8F2`, borderRadius: '6px' }}>
          <NestedList
            open={open}
            setOpen={setOpen}
            childSelected={childSelected}
            setChildSelected={setChildSelected}
            data={nestedListItems}
          />
          <Box sx={{ width: '100%' }}>
            <IncomeOverviewCard selectedListItem={selectedListItem?.text || ''} selectedChildItem={selectedChildItem?.text || ''} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
