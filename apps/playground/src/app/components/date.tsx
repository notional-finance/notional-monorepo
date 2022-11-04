import { Box, Typography, useTheme } from '@mui/material';
import Moment from 'react-moment';

/* eslint-disable-next-line */
export interface DateProps {
  timestampInSeconds: number;
  locale?: 'en-US' | 'zh';
  fontSize?: string;
}

export function Date({
  locale = 'en-US',
  timestampInSeconds,
  fontSize,
}: DateProps) {
  const theme = useTheme();

  const displayDateFormatForLocale = () => {
    switch (locale) {
      case 'en-US':
        return (
          <Moment format="MMM D YYYY" unix>
            {timestampInSeconds}
          </Moment>
        );
      case 'zh':
        return (
          <Moment format="YYYY MMM D" unix>
            {timestampInSeconds}
          </Moment>
        );
      default:
        return (
          <Moment format="MMM D YYYY" unix>
            {timestampInSeconds}
          </Moment>
        );
    }
  };

  return (
    <Box
      sx={{
        fontSize: fontSize || '.625rem',
        letterSpacing: '1px',
        fontWeight: 400,
      }}
    >
      {displayDateFormatForLocale()}
    </Box>
  );
}

export default Date;
