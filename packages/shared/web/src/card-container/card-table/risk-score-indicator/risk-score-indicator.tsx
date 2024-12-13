import { useTheme, Box, SxProps } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { HeadingSubtitle } from '@notional-finance/mui';

interface RiskScoreIndicatorProps {
  riskLevel: string;
  hideText?: boolean;
  showThemeColors?: boolean;
  sx?: SxProps;
}

export const RiskScoreIndicator = ({
  riskLevel,
  hideText,
  showThemeColors,
}: RiskScoreIndicatorProps) => {
  const theme = useTheme();
  const riskData = {
    veryLow: {
      activeBars: [true, false, false, false, false],
      title: <FormattedMessage defaultMessage={'Very Low'} />,
    },
    low: {
      activeBars: [true, true, false, false, false],
      title: <FormattedMessage defaultMessage={'Low'} />,
    },
    medium: {
      activeBars: [true, true, true, false, false],
      title: <FormattedMessage defaultMessage={'Medium'} />,
    },
    high: {
      activeBars: [true, true, true, true, false],
      title: <FormattedMessage defaultMessage={'High'} />,
    },
  };

  const bgColor = showThemeColors
    ? theme.palette.borders.paper
    : colors.matteGreen;
  const activeBgColor = showThemeColors
    ? theme.palette.primary.light
    : colors.neonTurquoise;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          marginRight: theme.spacing(1),
        }}
      >
        {riskData[riskLevel].activeBars.map((active, index) => (
          <Box
            key={index}
            sx={{
              width: '3px',
              marginRight: '3px',
              background: active ? activeBgColor : bgColor,
              height: theme.spacing(2),
            }}
          ></Box>
        ))}
      </Box>
      {!hideText && (
        <HeadingSubtitle>{riskData[riskLevel].title}</HeadingSubtitle>
      )}
    </Box>
  );
};

export default RiskScoreIndicator;
