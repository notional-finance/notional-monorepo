import { defineMessage, FormattedMessage } from 'react-intl';
import { SxProps, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { Caption } from '../typography/typography';
import { VaultType } from '@notional-finance/core-entities';
import { AutoReinvestIcon, DirectIcon } from '@notional-finance/icons';
import { useAppStore } from '@notional-finance/notionable';

export const ReinvestPill = ({
  vaultType,
  sx,
}: {
  vaultType: VaultType;
  sx?: SxProps;
}) => {
  const theme = useTheme();
  const { themeVariant } = useAppStore();

  const reinvestOptions =
    vaultType === 'SingleSidedLP_DirectClaim'
      ? {
          Icon: DirectIcon,
          label: defineMessage({
            defaultMessage: 'Direct Claim',
            description: 'Direct Claim',
          }),
        }
      : vaultType === 'SingleSidedLP_AutoReinvest' ||
        vaultType === 'SingleSidedLP_Points'
      ? {
          Icon: AutoReinvestIcon,
          label: defineMessage({
            defaultMessage: 'Auto-Reinvest',
            description: 'Auto Reinvest',
          }),
        }
      : undefined;

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
      {reinvestOptions?.Icon && <reinvestOptions.Icon />}
      <FormattedMessage {...reinvestOptions?.label} />
    </Caption>
  );
};

export default ReinvestPill;
