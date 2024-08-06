'use client';

import { forwardRef, CSSProperties, ReactElement, Ref } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Card, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// project-import
import Highlighter from './third-party/Highlighter';
import { ThemeMode } from 'config';

// types
import { KeyedObject } from 'types/root';

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProps extends KeyedObject {
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

function MainCard(
  {
    border = true,
    boxShadow,
    children,
    subheader,
    content = true,
    contentSX = {},
    darkTitle,
    divider = true,
    secondary,
    shadow,
    sx = {},
    title,
    codeHighlight = false,
    codeString,
    modal = false,
    ...others
  }: MainCardProps,
  ref: Ref<HTMLDivElement>
) {
  const theme = useTheme();
  boxShadow = theme.palette.mode === ThemeMode.DARK ? boxShadow || true : boxShadow;

  return (
    <Card
      sx={{
        position: 'relative',
        border: border ? '1px solid' : 'none',
        borderRadius: 1,
        borderColor: theme.palette.mode === ThemeMode.DARK ? 'divider' : 'grey.A800',
        boxShadow: boxShadow && (!border || theme.palette.mode === ThemeMode.DARK) ? shadow || theme.customShadows.z1 : 'none',
        ':hover': {
          boxShadow: boxShadow ? shadow || theme.customShadows.z1 : 'none'
        },
        ...(theme.palette.mode === ThemeMode.DARK && {
          backgroundImage: 'none'
        }),
        ...(codeHighlight && {
          '& pre': {
            margin: 0,
            padding: '12px !important',
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.75rem'
          }
        }),
        ...(modal && {
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: `calc( 100% - 50px)`, sm: 'auto' },
          '& .MuiCardContent-root': {
            overflowY: 'auto',
            minHeight: 'auto',
            maxHeight: `calc(100vh - 200px)`
          }
        }),
        ...sx
      }}
      ref={ref}
      {...others}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title} action={secondary} subheader={subheader} />
      )}
      {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h4">{title}</Typography>} action={secondary} />}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}

      {/* card footer - clipboard & highlighter  */}
      {codeString && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Highlighter codeString={codeString} codeHighlight={codeHighlight} />
        </>
      )}
    </Card>
  );
}

export default forwardRef(MainCard);
