import { Box, useTheme } from '@mui/material';
import { CopyIcon } from '@notional-finance/icons';
import { CopyCaption } from '../../copy-caption/copy-caption';
import { useState } from 'react';

// interface ViewAsAddressCellProps {
// text: string;
// communityName: string;
// dataSet: string;
// cellCallBack: (address: string) => void;
// fullAddress: string;
// }

export const ViewAsAddressCell = ({ cell }) => {
  const theme = useTheme();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { getValue, column } = cell;
  const value = getValue();
  if (!value) return null;
  const { text, fullAddress, network } = value;

  if (showAlert) {
    setTimeout(() => {
      setShowAlert(false);
    }, 1000);
  }

  const handleClick = () => {
    if (fullAddress) {
      column.columnDef.cellCallBack(fullAddress, network);
    }
  };

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
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          cursor: 'pointer',
          '&:hover': {
            color: theme.palette.typography.accent,
          },
        }}
        onClick={handleClick}
      >
        {text}
      </Box>
      <Box onClick={handleCopy} sx={{ cursor: 'pointer' }}>
        <CopyIcon
          fill={theme.palette.typography.accent}
          sx={{
            marginLeft: '0.25rem',
            height: '1rem',
          }}
        />
      </Box>
      <CopyCaption
        showAlert={showAlert}
        sx={{ marginLeft: `0px`, position: 'absolute' }}
      />
    </Box>
  );
};

export default ViewAsAddressCell;
