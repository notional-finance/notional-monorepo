import { useState, useEffect } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { format } from 'date-fns';

// project import
import IconButton from 'components/@extended/IconButton';

// assets
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import LayoutOutlined from '@ant-design/icons/LayoutOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import OrderedListOutlined from '@ant-design/icons/OrderedListOutlined';
import PicCenterOutlined from '@ant-design/icons/PicCenterOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

// constant
const viewOptions = [
  {
    label: 'Month',
    value: 'dayGridMonth',
    icon: AppstoreOutlined
  },
  {
    label: 'Week',
    value: 'timeGridWeek',
    icon: LayoutOutlined
  },
  {
    label: 'Day',
    value: 'timeGridDay',
    icon: PicCenterOutlined
  },
  {
    label: 'Agenda',
    value: 'listWeek',
    icon: OrderedListOutlined
  }
];

// ==============================|| CALENDAR - TOOLBAR ||============================== //

export interface ToolbarProps {
  date: number | Date;
  view: string;
  onClickNext: () => void;
  onClickPrev: () => void;
  onClickToday: () => void;
  onChangeView: (s: string) => void;
}

export default function Toolbar({ date, view, onClickNext, onClickPrev, onClickToday, onChangeView }: ToolbarProps) {
  const matchDownSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [viewFilter, setViewFilter] = useState(viewOptions);

  useEffect(() => {
    if (matchDownSM) {
      const filter = viewOptions.filter((item) => item.value !== 'dayGridMonth' && item.value !== 'timeGridWeek');
      setViewFilter(filter);
    } else {
      setViewFilter(viewOptions);
    }
  }, [matchDownSM]);

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={matchDownSM ? 1 : 3} sx={{ pb: 3 }}>
      <Button variant="outlined" onClick={onClickToday} size={matchDownSM ? 'small' : 'medium'}>
        Today
      </Button>
      <Stack direction="row" alignItems="center" spacing={matchDownSM ? 0.5 : 3}>
        <IconButton onClick={onClickPrev} size={matchDownSM ? 'small' : 'large'}>
          <LeftOutlined />
        </IconButton>
        <Typography variant={matchDownSM ? 'h5' : 'h3'} color="text.primary">
          {format(date, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={onClickNext} size={matchDownSM ? 'small' : 'large'}>
          <RightOutlined />
        </IconButton>
      </Stack>
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        {viewFilter.map((viewOption) => {
          const Icon = viewOption.icon;
          return (
            <Tooltip title={viewOption.label} key={viewOption.value}>
              <Button
                disableElevation
                size={matchDownSM ? 'small' : 'medium'}
                variant={viewOption.value === view ? 'contained' : 'outlined'}
                onClick={() => onChangeView(viewOption.value)}
              >
                <Icon style={{ fontSize: '1.3rem' }} />
              </Button>
            </Tooltip>
          );
        })}
      </ButtonGroup>
    </Stack>
  );
}
