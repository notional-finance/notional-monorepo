import { Box, Modal as MuiModal, useTheme } from '@mui/material';
import { CloseX } from '@notional-finance/icons';
import { Body, Caption, H4 } from '../typography/typography';

interface ModalProps {
  index: number;
  modalContent: {
    title: any;
    description: any;
    productDetails?: {
      title: string;
      textValue?: string;
      compValue?: React.ReactNode;
    }[];
  };
  activeModal: number | null;
  setActiveModal: (index: number | null) => void;
}

export const Modal = ({
  index,
  modalContent,
  activeModal,
  setActiveModal,
}: ModalProps) => {
  const theme = useTheme();
  const { title, description, productDetails } = modalContent;

  return (
    <MuiModal
      open={activeModal === index}
      onClose={() => setActiveModal(null)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          bgcolor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius(),
          boxShadow: 24,
          padding: theme.spacing(3),
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        <Box
          sx={{
            marginBottom: theme.spacing(2),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <H4>{title}</H4>
          <CloseX
            onClick={() => setActiveModal(null)}
            style={{
              stroke: theme.palette.primary.light,
              cursor: 'pointer',
            }}
          />
        </Box>
        <Body>{description}</Body>
        {productDetails && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              marginTop: theme.spacing(6),
            }}
          >
            <Box
              sx={{
                height: '1px',
                width: '100%',
                background: theme.palette.borders.paper,
                marginBottom: `-${theme.spacing(6)}`,
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: theme.spacing(3),
              }}
            >
              {productDetails.map(({ title, textValue, compValue }, i) => (
                <Box key={i}>
                  <Caption
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      paddingBottom: theme.spacing(2),
                    }}
                  >
                    {title}
                  </Caption>
                  <Body
                    sx={{
                      color: theme.palette.typography.main,
                      textAlign: 'center',
                    }}
                  >
                    {textValue}
                  </Body>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {compValue}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </MuiModal>
  );
};

export default Modal;
