import { Typography, TypographyProps, useTheme } from '@mui/material';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface SectionTitleProps extends TypographyProps {
  heading: ReactNode;
}

export function SectionTitle({ heading, ...rest }: SectionTitleProps) {
  const theme = useTheme();
  return (
    <Typography
      variant="h3"
      color={theme.palette.primary.light}
      sx={{
        fontSize: '1rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: '1rem',
        paddingLeft: '1rem',
      }}
      {...rest}
    >
      {heading}
    </Typography>
  );
}

export default SectionTitle;
