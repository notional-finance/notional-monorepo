'use client';

import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

// project import
import MainCard from 'components/MainCard';
import InvoiceWidgetCard from 'sections/apps/invoice/InvoiceWidgetCard';
import InvoiceIncomeAreaChart from 'sections/apps/invoice/InvoiceIncomeAreaChart';

export default function OverviewChart({ widgetData }: { widgetData: any }) {
  const [activeChart, setActiveChart] = useState<number>(0);

  const [series, setSeries] = useState([
    {
      name: 'TEAM A',
      type: 'column',
      data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 25]
    },
    {
      name: 'TEAM B',
      type: 'line',
      data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 35]
    }
  ]);

  const handleSeries = (index: number) => {
    setActiveChart(index);
    switch (index) {
      case 1:
        setSeries([
          {
            name: 'TEAM A',
            type: 'column',
            data: [10, 15, 8, 12, 11, 7, 10, 13, 22, 10, 18, 4]
          },
          {
            name: 'TEAM B',
            type: 'line',
            data: [12, 18, 15, 17, 12, 10, 14, 16, 25, 17, 20, 8]
          }
        ]);
        break;
      case 2:
        setSeries([
          {
            name: 'TEAM A',
            type: 'column',
            data: [12, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 25]
          },
          {
            name: 'TEAM B',
            type: 'line',
            data: [17, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 35]
          }
        ]);
        break;
      case 3:
        setSeries([
          {
            name: 'TEAM A',
            type: 'column',
            data: [1, 2, 3, 5, 1, 0, 2, 0, 6, 1, 5, 3]
          },
          {
            name: 'TEAM B',
            type: 'line',
            data: [5, 3, 5, 6, 7, 0, 3, 1, 7, 3, 5, 4]
          }
        ]);
        break;
      case 0:
      default:
        setSeries([
          {
            name: 'TEAM A',
            type: 'column',
            data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 25]
          },
          {
            name: 'TEAM B',
            type: 'line',
            data: [34, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 35]
          }
        ]);
    }
  };

  return (
    <MainCard>
      <Grid container spacing={2}>
        {widgetData.map((data: any, index: number) => (
          <Grid item xs={12} sm={6} md={widgetData.length === 2 ? 6 : 4} key={index}>
            <Box onClick={() => handleSeries(index)} sx={{ cursor: 'pointer' }}>
              <InvoiceWidgetCard
                title={data.title}
                count={data.count}
                percentage={data.percentage}
                isLoss={data.isLoss}
                invoice={data.invoice}
                color={data.color.main}
                isActive={index === activeChart}
              />
            </Box>
          </Grid>
        ))}
        <Grid item xs={12}>
          <InvoiceIncomeAreaChart series={series} />
        </Grid>
      </Grid>
    </MainCard>
  );
}
