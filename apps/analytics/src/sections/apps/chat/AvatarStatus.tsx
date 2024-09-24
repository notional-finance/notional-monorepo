// material-ui
import { useTheme } from '@mui/material/styles';

// assets
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import ClockCircleFilled from '@ant-design/icons/ClockCircleFilled';
import MinusCircleFilled from '@ant-design/icons/MinusCircleFilled';

type Props = {
  status: string;
};

// ==============================|| AVATAR STATUS ICONS ||============================== //

export default function AvatarStatus({ status }: Props) {
  const theme = useTheme();

  switch (status) {
    case 'available':
      return <CheckCircleFilled style={{ color: theme.palette.success.main }} />;

    case 'do_not_disturb':
      return <MinusCircleFilled style={{ color: theme.palette.secondary.main }} />;

    case 'offline':
      return <ClockCircleFilled style={{ color: theme.palette.error.main }} />;

    default:
      return null;
  }
}
