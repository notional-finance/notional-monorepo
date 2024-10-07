import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// project-imports
import FormCustomerAdd from './FormCustomerAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetCustomer } from 'api/customer';

// types
import { CustomerList } from 'types/customer';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  customer?: CustomerList | null;
}

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function CustomerModal({ open, modalToggler, customer }: Props) {
  const { customersLoading: loading } = useGetCustomer();

  const closeModal = () => modalToggler(false);

  const customerForm = useMemo(
    () => !loading && <FormCustomerAdd customer={customer || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [customer, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-customer-add-label"
          aria-describedby="modal-customer-add-description"
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="center">
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                customerForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
