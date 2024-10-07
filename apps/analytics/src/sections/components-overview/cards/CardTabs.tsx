'use client';

import { useState, ReactNode } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

// ==============================|| TAB PANEL ||============================== //

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

// ==============================|| CARD - TAB ||============================== //

export default function CardTabs({ activeTab }: { activeTab?: number }) {
  const [value, setValue] = useState(activeTab || 0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Article" {...a11yProps(0)} />
          <Tab label="App" {...a11yProps(1)} />
          <Tab label="Project" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Typography variant="h5" gutterBottom color="text.secondary">
          Article Content
        </Typography>
        <Typography variant="h6" gutterBottom={!activeTab}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero dignissim, viverra augue eu, semper ligula. Mauris
          purus sem, sagittis eu mauris et, viverra lobortis urna.
        </Typography>
        {!activeTab && <Typography variant="h6">Suspendisse sed lectus ac nunc rhoncus scelerisque.</Typography>}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography variant="h5" gutterBottom color="text.secondary">
          App Content
        </Typography>
        <Typography variant="h6">
          Suspendisse sed lectus ac nunc rhoncus scelerisque. Integer vitae fringilla leo. Aliquam tincidunt et turpis non mattis. Ut sed
          semper orci, sed facilisis mauris. Suspendisse blandit velit sit amet velit porta aliquet.
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography variant="h5" gutterBottom color="text.secondary">
          Project Content
        </Typography>
        <Typography variant="h6">
          Nam egestas sollicitudin nisl, sit amet aliquam risus pharetra ac. Donec ac lacinia orci. Phasellus ut enim eu ligula placerat
          cursus in nec est.
        </Typography>
      </TabPanel>
    </Box>
  );
}
