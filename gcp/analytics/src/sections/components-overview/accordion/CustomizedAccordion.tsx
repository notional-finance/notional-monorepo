'use client';

import { useState } from 'react';

// material-ui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// assets
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import PictureOutlined from '@ant-design/icons/PictureOutlined';
import SmileOutlined from '@ant-design/icons/SmileOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| ACCORDION - CUSTOMIZED ||============================== //

export default function CustomizedAccordion() {
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    console.log('event - ', event, newExpanded);
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <MainCard title="Customized">
      <Box
        sx={{
          '& .MuiAccordion-root': {
            borderColor: 'divider',
            '& .MuiAccordionSummary-root': {
              bgcolor: 'transparent',
              flexDirection: 'row',
              '&:focus-visible': {
                bgcolor: 'primary.lighter'
              }
            },
            '& .MuiAccordionDetails-root': {
              borderColor: 'divider'
            },
            '& .Mui-expanded': {
              color: 'primary.main'
            }
          }
        }}
      >
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SmileOutlined />
              <Typography variant="h6">Accordion 01</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography variant="h5">Lorem ipsum dolor sit amet,</Typography>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <UserOutlined />
              <Typography variant="h6">Accordion 02</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ClockCircleOutlined />
              <Typography variant="h6">Accordion 03</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PictureOutlined />
              <Typography variant="h6">Accordion 04</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </MainCard>
  );
}
