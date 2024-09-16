'use client';

import { forwardRef, useState, Ref } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper, { PaperProps } from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

// third-party
import Draggable from 'react-draggable';

function paperComponent(props: PaperProps, ref: Ref<HTMLDivElement>) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper ref={ref} {...props} />
    </Draggable>
  );
}

const PaperComponent = forwardRef(paperComponent);

// ==============================|| DIALOG - DRAGGABLED ||============================== //

export default function DraggableDialog() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
        Open draggable dialog
      </Button>
      <Dialog open={open} onClose={handleClose} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
        <Box sx={{ p: 1, py: 1.5 }}>
          <DialogTitle sx={{ cursor: 'move' }} id="draggable-dialog-title">
            Subscribe
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              To subscribe to this website, please enter your email address here. We will send updates occasionally.
            </DialogContentText>
            <TextField id="name" placeholder="Email Address" type="email" fullWidth variant="outlined" />
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleClose}>
              Subscribe
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
