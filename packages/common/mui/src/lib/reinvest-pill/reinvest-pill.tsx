import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { SxProps, useTheme } from '@mui/material';
import { useAppState } from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { Caption } from '../typography/typography';

export const ReinvestPill = ({
  Icon,
  label,
  sx,
}: {
  Icon: any;
  label: MessageDescriptor;
  sx?: SxProps;
}) => {
  const theme = useTheme();
  const { themeVariant } = useAppState();

  return (
    <Caption
      sx={{
        display: 'flex',
        justifyContent: 'end',
        padding: '3px 4px',
        color:
          themeVariant === THEME_VARIANTS.LIGHT
            ? colors.darkGrey
            : colors.white,
        borderRadius: theme.shape.borderRadius(),
        width: 'fit-content',
        background: theme.palette.pending.light,
        '.stroke-icon': {
          stroke: theme.palette.pending.main,
        },
        textTransform: 'none',
        fontWeight: 500,
        marginBottom: theme.spacing(0.5),
        svg: {
          height: theme.spacing(2),
          width: theme.spacing(2),
          fill: theme.palette.pending.main,
          marginRight: theme.spacing(1),
        },
        ...sx,
      }}
    >
      <Icon />
      <FormattedMessage {...label} />
    </Caption>
  );
};

export default ReinvestPill;
