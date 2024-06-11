import { useTheme, Box } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { HeadingSubtitle } from '@notional-finance/mui';

export const RiskScoreIndicator = (props) => {
  const theme = useTheme();
  const { riskLevel } = props;
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
              background: active ? colors.neonTurquoise : colors.matteGreen,
              height: theme.spacing(2),
            }}
          ></Box>
        ))}
      </Box>
      <HeadingSubtitle>{riskData[riskLevel].title}</HeadingSubtitle>
    </Box>
  );
};

export default RiskScoreIndicator;
