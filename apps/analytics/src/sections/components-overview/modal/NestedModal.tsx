'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// ==============================|| MODAL - CHILD ||============================== //

function ChildModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen} variant="contained">
        Open Child
      </Button>
      <Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title" aria-describedby="child-modal-description">
        <MainCard title="Child Modal" modal darkTitle content={false}>
          <CardContent>
            <Typography id="modal-modal-description">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</Typography>
            <Typography id="modal-modal-description">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</Typography>
            <Typography id="modal-modal-description">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</Typography>
            <Typography id="modal-modal-description">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</Typography>
            <Typography id="modal-modal-description">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</Typography>
          </CardContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
            <Button color="error" size="small" onClick={handleClose}>
              Close Child Modal
            </Button>
            <Button variant="contained" size="small">
              Submit
            </Button>
          </Stack>
        </MainCard>
      </Modal>
    </>
  );
}

// ==============================|| MODAL - NESTED ||============================== //

export default function NestedModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <MainCard title="Nested">
      <Button onClick={handleOpen} variant="contained">
        Open Nested Modal
      </Button>
      <Modal open={open} onClose={handleClose} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
        <MainCard title="Parent Modal" modal darkTitle content={false}>
          <CardContent>
            <Typography id="modal-modal-description">
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.Duis mollis, est non commodo luctus, nisi erat porttitor
              ligula.
            </Typography>
          </CardContent>
          <Divider />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
            <Button color="error" size="small" onClick={handleClose}>
              Cancel
            </Button>
            <ChildModal />
          </Stack>
        </MainCard>
      </Modal>
    </MainCard>
  );
}
