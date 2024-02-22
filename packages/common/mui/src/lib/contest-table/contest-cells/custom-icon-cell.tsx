import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { CopyCaption } from '../../copy-caption/copy-caption';
import { TokenIcon } from '@notional-finance/icons';

export const CustomIconCell = ({ cell }) => {
  const theme = useTheme();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { value } = cell;
  if (!value) return null;
  const { text, fullAddress, communityName } = value;

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
        fontSize: '18px',
        cursor: 'pointer',
      }}
      onClick={handleCopy}
    >
      <TokenIcon
        symbol={communityName}
        size="medium"
        style={{ marginRight: '8px' }}
      />
      {text}
      <CopyCaption
        showAlert={showAlert}
        sx={{ marginLeft: `-${theme.spacing(15)}`, position: 'relative' }}
      />
    </Box>
  );
};

export default CustomIconCell;
