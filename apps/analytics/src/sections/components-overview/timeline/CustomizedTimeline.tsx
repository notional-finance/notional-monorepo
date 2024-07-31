'use client';

// material-ui
import Typography from '@mui/material/Typography';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from '@mui/lab';

// project import
import MainCard from 'components/MainCard';

// assets
import CoffeeOutlined from '@ant-design/icons/CoffeeOutlined';
import DesktopOutlined from '@ant-design/icons/DesktopOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import RetweetOutlined from '@ant-design/icons/RetweetOutlined';

// ==============================|| TIMELINE - CUSTOMIZED ||============================== //

export default function CustomizedTimeline() {
  return (
    <MainCard title="Customized">
      <Timeline
        position="alternate"
        sx={{
          '& .MuiTimelineItem-root': { minHeight: 90 },
          '& .MuiTimelineOppositeContent-root': { mt: 0.5 },
          '& .MuiTimelineDot-root': {
            borderRadius: 1.25,
            boxShadow: 'none',
            margin: 0,
            ml: 1.25,
            mr: 1.25,
            p: 1,
            '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
          },
          '& .MuiTimelineContent-root': { borderRadius: 1, bgcolor: 'secondary.lighter', height: '100%' },
          '& .MuiTimelineConnector-root': { border: '1px dashed', borderColor: 'secondary.light', bgcolor: 'transparent' }
        }}
      >
        <TimelineItem>
          <TimelineOppositeContent align="right" variant="body2" color="text.secondary">
            9:30 am
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
              <CoffeeOutlined style={{ fontSize: '1.3rem' }} />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">Eat</Typography>
            <Typography color="text.secondary">Because you need strength</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent variant="body2" color="text.secondary">
            10:00 am
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ color: 'success.main', bgcolor: 'success.lighter' }}>
              <DesktopOutlined style={{ fontSize: '1.3rem' }} />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">Code</Typography>
            <Typography color="text.secondary">Because it&apos;s awesome!</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent align="right" variant="body2" color="text.secondary">
            11:30 am
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ color: 'warning.main', bgcolor: 'warning.lighter' }}>
              <GiftOutlined style={{ fontSize: '1.3rem' }} />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">Gift</Typography>
            <Typography color="text.secondary">Because you need.</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent align="right" variant="body2" color="text.secondary">
            12:30 am
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
              <RetweetOutlined style={{ fontSize: '1.3rem' }} />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">Repeat</Typography>
            <Typography color="text.secondary">This is the life you love!</Typography>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </MainCard>
  );
}
