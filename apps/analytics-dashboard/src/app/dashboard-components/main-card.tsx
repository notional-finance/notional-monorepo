'use client';

import { CSSProperties, ReactElement } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Card, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' },
};

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children: ReactElement;
  subheader?: ReactElement | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps['sx'];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps['sx'];
  secondary?: CardHeaderProps['action'];
  shadow?: string;
  title?: ReactElement | string;
  codeHighlight?: boolean;
  codeString?: string;
  modal?: boolean;
}

function MainCard({
  border = true,
  children,
  subheader,
  content = true,
  contentSX = {},
  darkTitle,
  divider = true,
  secondary,
  sx = {},
  title,
  codeHighlight = false,
  codeString,
  modal = false,
  ...others
}: MainCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        position: 'relative',
        border: border ? '1px solid' : 'none',
        borderRadius: 1,
        borderColor: 'grey.A800',
        boxShadow: 'none',
        ':hover': {
          boxShadow: 'none',
        },
        ...(codeHighlight && {
          '& pre': {
            margin: 0,
            padding: '12px !important',
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.75rem',
          },
        }),
        ...(modal && {
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: `calc( 100% - 50px)`, sm: 'auto' },
          '& .MuiCardContent-root': {
            overflowY: 'auto',
            minHeight: 'auto',
            maxHeight: `calc(100vh - 200px)`,
          },
        }),
        ...sx,
      }}
      {...others}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader
          sx={headerSX}
          titleTypographyProps={{ variant: 'subtitle1' }}
          title={title}
          action={secondary}
          subheader={subheader}
        />
      )}
      {darkTitle && title && (
        <CardHeader
          sx={headerSX}
          title={<Typography variant="h4">{title}</Typography>}
          action={secondary}
        />
      )}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}

      {/* card footer - clipboard & highlighter  */}
      {codeString && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {/* <Highlighter codeString={codeString} codeHighlight={codeHighlight} /> */}
        </>
      )}
    </Card>
  );
}

export default MainCard;
