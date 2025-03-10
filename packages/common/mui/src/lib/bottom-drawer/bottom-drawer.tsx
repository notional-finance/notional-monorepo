import { alpha, Box, styled, SxProps, Theme } from '@mui/material';
import { Drawer } from 'vaul';
import { forwardRef, useImperativeHandle, useState } from 'react';

interface BottomDrawerProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
  open?: boolean;
  noBackdrop?: boolean;
  noClose?: boolean;
  disablePreventScroll?: boolean;
  contextSx?: SxProps<Theme> | undefined;
}

export type BottomDrawerRef = {
  open: () => void;
  close: () => void;
};

const BottomDrawer = forwardRef<BottomDrawerRef, BottomDrawerProps>(
  (
    {
      children,
      trigger,
      title,
      open = false,
      noBackdrop = false,
      noClose = false,
      disablePreventScroll = false,
    },
    ref
  ) => {
    const [openState, setOpenState] = useState(open);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setOpenState(true);
        },
        close: () => {
          setOpenState(false);
        },
      }),
      []
    );

    return (
      <Drawer.Root
        dismissible={!noClose}
        open={openState}
        onOpenChange={setOpenState}
        disablePreventScroll={disablePreventScroll}
        fixed
        modal={!noClose}
      >
        {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
        <Drawer.Portal>
          {!noBackdrop && <Overlay />}
          <Drawer.Title>{title}</Drawer.Title>
          <DrawerContent>
            <Content>{children}</Content>
          </DrawerContent>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }
);

const Overlay = styled(Drawer.Overlay)(({ theme }) => ({
  height: '100vh',
  width: '100vw',
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  backgroundColor: alpha(theme.palette.background.accentDefault, 0.5),
}));

const DrawerContent = styled(Drawer.Content)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  height: 'fit-content',
  position: 'sticky',
  inset: 0,
  bottom: 0,
  left: 0,
  right: 0,
  outline: 'none',
  zIndex: 10001,
  borderTopLeftRadius: theme.spacing(2),
  borderTopRightRadius: theme.spacing(2),
  boxShadow: theme.shape.cardShadowLight,
}));

const Content = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
}));

export default BottomDrawer;
