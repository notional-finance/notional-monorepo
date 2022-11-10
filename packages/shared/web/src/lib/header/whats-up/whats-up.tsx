import { Box, Typography, Button, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import HeaderCard from '@notional-finance/assets/images/HeaderCard.png';
import { NotionalLogo } from '@notional-finance/styles';

// To Update the HeaderCard:
// - Replace the HeaderCard.png image with a new image that has an
//   ratio of 335x198 (or close)
// - Update the `ctaLink` variable in the function
// - Update the text in the `global.header.section.whatsup.cta` variable

export function WhatsUp() {
  const theme = useTheme();
  const ctaLink = 'https://blog.notional.finance/introducing-leveraged-vaults/';

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.light,
        width: 400,
        height: 580,
        padding: '1.375rem',
        paddingTop: '48px',
      }}
    >
      <Typography
        variant="h3"
        color={theme.palette.common.white}
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '2rem',
        }}
      >
        <FormattedMessage defaultMessage={"What's Up"} />
      </Typography>

      <Box
        sx={{
          position: 'relative',
          background: `${theme.gradient.darkBlue}`,
          width: 336,
          height: 189,
          img: {
            position: 'absolute',
            right: 0,
          },
          '.logo': {
            marginLeft: '1rem',
            marginTop: '2rem',
          },
        }}
      >
        <NotionalLogo height="1rem" className="logo" />
        <a href={ctaLink} target="_blank" rel="noreferrer">
          <img src={HeaderCard} height="189px" alt="header card" />
        </a>
      </Box>

      <Button
        variant="contained"
        href={ctaLink}
        target="_blank"
        rel="noreferrer"
        sx={{
          color: theme.palette.common.white,
          backgroundColor: theme.palette.background.accentDefault,
          width: '336px',
          height: '56px',
          marginTop: '42px',
          fontSize: '1rem',
          fontWeight: 700,
        }}
      >
        <FormattedMessage defaultMessage={'Learn About Leveraged Vaults'} />
      </Button>
    </Box>
  );
}

export default WhatsUp;
