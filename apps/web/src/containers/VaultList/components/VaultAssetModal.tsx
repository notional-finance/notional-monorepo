import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
} from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { H3 } from '@notional-finance/mui';
import RichText from '../../TransactionScreen/components/rich-text';

interface VaultAssetModalProps {
  open: boolean;
  onClose: () => void;
  assetName: string;
  assetLogoUrl?: string;
  assetDescription?: string;
}

export const VaultAssetModal = ({
  open,
  onClose,
  assetName,
  assetLogoUrl,
  assetDescription,
}: VaultAssetModalProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: theme.spacing(117.5),
          maxWidth: `calc(100% - ${theme.spacing(8)})`,
          borderRadius: theme.shape.borderRadius(),
        },
      }}
    >
      <DialogContent sx={{ padding: theme.spacing(3) }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(1.25),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing(1.5),
              marginBottom: theme.spacing(3),
            }}
          >
            <TokenIcon symbol={assetLogoUrl || 'unknown'} size="large" />
            <H3 gutter="none">{assetName}</H3>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
        <Box
          sx={{
            color: theme.palette.typography.light,
            overflowWrap: 'anywhere',
          }}
        >
          <RichText htmlInput={assetDescription || ''} clearPadding />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
