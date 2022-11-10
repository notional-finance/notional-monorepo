import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { H1, H3 } from '@notional-finance/mui';

export const OurMission = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '84%',
        borderTop: `4px solid ${theme.palette.info.main}`,
        margin: theme.spacing(0, 'auto'),
        position: 'relative',
        top: theme.spacing(-18),
        background: theme.palette.background.default,
        boxShadow: '0px 4px 10px rgb(20 42 74 / 7%)',
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          padding: theme.spacing(14, 4),
          margin: theme.spacing(0, 'auto'),
          textAlign: 'center',
          color: theme.palette.common.black,
        }}
      >
        <H1 marginBottom={theme.spacing(8)}>
          <FormattedMessage defaultMessage={'Our Mission'} description={'section title'} />
        </H1>
        <H3
          fontWeight="light"
          lineHeight={2}
          maxWidth={theme.spacing(80)}
          margin={theme.spacing(0, 'auto')}
        >
          <FormattedMessage
            defaultMessage={
              'We believe that everyone should have access to secure financial products that provide certainty and lay the groundwork for long-term financial success.'
            }
            description={'mission statement'}
          />
        </H3>
      </Box>
      <Box
        sx={{
          padding: theme.spacing(14, 4),
          margin: theme.spacing(0, 'auto'),
          textAlign: 'center',
          color: theme.palette.common.white,
          background: 'linear-gradient(267.16deg, #004453 19.48%, #002B36 105.58%)',
        }}
      >
        <H1
          sx={{
            marginBottom: theme.spacing(8),
            background: theme.gradient.landing,
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          <FormattedMessage
            defaultMessage={'Permissionless Innovation'}
            description={'section title'}
          />
        </H1>
        <H3
          contrast
          fontWeight="light"
          lineHeight={2}
          maxWidth={theme.spacing(80)}
          margin={theme.spacing(0, 'auto')}
        >
          <FormattedMessage
            defaultMessage="Notional is a community-owned and governed protocol supported by the Notional Finance Foundation."
            description={'section description'}
          />
        </H3>
      </Box>
    </Box>
  );
};
