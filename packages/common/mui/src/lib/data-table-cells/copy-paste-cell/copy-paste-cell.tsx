import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { CopyCaption } from '../../copy-caption/copy-caption';

// interface CopyPasteCellProps {
// text: string;
// communityName: string;
// dataSet: string;
// fullAddress: string;
// }

export const CopyPasteCell = ({ cell }) => {
  const theme = useTheme();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { getValue } = cell;
  const value = getValue();
  if (!value) return null;
  const { text, fullAddress } = value;

  if (showAlert) {
    setTimeout(() => {
      setShowAlert(false);
    }, 1000);
  }

  const handleCopy = () => {
    if (fullAddress) {
      navigator.clipboard.writeText(fullAddress);
      setShowAlert(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        cursor: 'pointer',
      }}
      onClick={handleCopy}
    >
      {text}
      <CopyCaption
        showAlert={showAlert}
        sx={{ marginLeft: `-${theme.spacing(15)}`, position: 'relative' }}
      />
    </Box>
  );
};

export default CopyPasteCell;
