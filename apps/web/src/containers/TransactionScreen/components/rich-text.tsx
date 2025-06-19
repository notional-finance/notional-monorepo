import { Box, useTheme } from '@mui/material';

const RichText = ({ htmlInput }: { htmlInput: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        padding: theme.spacing(0, 3),
        'h1, h2, h3, h4, h5, h6': {
          ...theme.typography.h5,
        },
        p: {
          ...theme.typography.body1,
        },
        'ul, ol': {
          paddingLeft: theme.spacing(3),
          margin: theme.spacing(1, 0),
        },
        li: {
          ...theme.typography.body1,
          display: 'list-item',
          marginBottom: theme.spacing(0.5),
          position: 'relative',
        },
        'ul li': {
          listStyle: 'none',
          '&::before': {
            content: '"•"',
            color: theme.palette.typography.main,
            fontWeight: 'bold',
            display: 'inline-block',
            width: '1em',
            marginLeft: '-1em',
            position: 'absolute',
            left: 0,
          },
        },
        'ol li': {
          listStyle: 'decimal',
        },
      }}
      dangerouslySetInnerHTML={{ __html: htmlInput }}
    />
  );
};

export default RichText;
