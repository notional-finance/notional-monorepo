import { Box, useTheme } from '@mui/material';
import { Caption } from '../../typography/typography';

export const MessageCell = (props: any) => {
  const theme = useTheme();
  const { getValue } = props.cell;
  const value = getValue();
  return (
    <Box>
      {value && (
        <Box
          sx={{
            width: 'fit-content',
            background: theme.palette.background.default,
            color: theme.palette.typography.main,
            borderRadius: theme.shape.borderRadius(),
            padding: theme.spacing(1, 2),
          }}
        >
          <Caption>{value}</Caption>
        </Box>
      )}
    </Box>
  );
};

export default MessageCell;
