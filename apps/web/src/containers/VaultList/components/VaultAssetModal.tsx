import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
} from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { BodySecondary, H3 } from '@notional-finance/mui';
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius(),
          padding: theme.spacing(1),
        },
      }}
    >
      <DialogContent sx={{ padding: theme.spacing(2, 2, 3) }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing(1.5),
            }}
          >
            <TokenIcon symbol={assetLogoUrl || 'unknown'} size="medium" />
            <H3 gutter="none">{assetName}</H3>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
        <BodySecondary gutter="none">
          <RichText htmlInput={assetDescription || ''} />
        </BodySecondary>
      </DialogContent>
    </Dialog>
  );
};
