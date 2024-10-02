import { SxProps, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { Caption } from '../typography/typography';
import { FormattedMessage } from 'react-intl';

 
export interface CopyCaptionProps {
  showAlert: boolean;
  title?: ReactNode;
  sx?: SxProps;
}

export function CopyCaption({ showAlert, title, sx }: CopyCaptionProps) {
  const theme = useTheme();

  return (
    <Caption
      sx={{
        background: theme.palette.background.paper,
        color: theme.palette.typography.main,
        padding: theme.spacing(1),
        position: 'absolute',
        borderRadius: theme.shape.borderRadius(),
        border: `1px solid ${theme.palette.primary.light}`,
        transition: 'all 0.3s ease-in-out',
        display: showAlert ? 'block' : 'none',
        ...sx,
      }}
    >
      {title || <FormattedMessage defaultMessage="Address Copied" />}
    </Caption>
  );
}

export default CopyCaption;
