import { ReactNode, useEffect, useState } from 'react';
import { ArrowIcon } from '@notional-finance/icons';
import { useTheme, Box, Button, styled, SxProps, Drawer } from '@mui/material';
import { H4, Subtitle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

export interface DrawerOptionProps {
  label: ReactNode;
  callback: () => void;
  symbol?: string;
}

interface MobileCurrencySelectorProps {
  options: DrawerOptionProps[];
  title: ReactNode;
  activeToken: string;
  sx?: SxProps;
}

export const MobileCurrencySelector = observer(
  ({ options, title, activeToken, sx }: MobileCurrencySelectorProps) => {
    const theme = useTheme();
    const { mobileNavOpen, setMobileNavOpen } = useAppStore();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
      if (!mobileNavOpen) {
        setIsOpen(false);
      }
    }, [mobileNavOpen]);

    const handleClose = () => {
      setMobileNavOpen(false);
      setIsOpen(false);
    };

    const handleOpen = () => {
      setMobileNavOpen(true);
      setIsOpen(true);
    };

    console.log({ title });

    return (
      <Box>
        <DropdownButton
          id="basic-button"
          aria-controls={isOpen ? 'basic-menu' : undefined}
          aria-haspopup="true"
          variant="contained"
          aria-expanded={isOpen ? 'true' : undefined}
          onClick={handleOpen}
          sx={{
            width: 'fit-content',
            height: '42px',
            boxShadow: 'none',
            ...sx,
          }}
          endIcon={
            <Box
              sx={{
                marginLeft: theme.spacing(1),
                height: theme.spacing(2),
                width: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: theme.palette.info.light,
                boxShadow: 'none',
              }}
            >
              <ArrowIcon
                sx={{
                  transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)',
                  transition: '.5s ease',
                  width: theme.spacing(1.5),
                  color: theme.palette.secondary.light,
                }}
              />
            </Box>
          }
        >
          <Subtitle>{title}</Subtitle>
        </DropdownButton>
        <Drawer
          anchor="top"
          open={isOpen}
          onClose={handleClose}
          sx={{
            '& .MuiDrawer-paper': {
              marginTop: theme.spacing(9),
              height: 'fit-content',
              borderBottomLeftRadius: theme.shape.borderRadius(),
              borderBottomRightRadius: theme.shape.borderRadius(),
              border: theme.shape.borderStandard,
              background: theme.palette.background.default,
            },
          }}
        >
          <InnerWrapper id="inner-dropdown">
            <Box sx={{ margin: 'auto' }}>
              <H4
                sx={{
                  fontWeight: 700,
                  color: theme.palette.typography.light,
                  padding: theme.spacing(2),
                  paddingTop: theme.spacing(5),
                }}
              >
                <FormattedMessage defaultMessage={'CURRENCIES'} />
              </H4>
              {options.map(({ label, callback, symbol }, i) => (
                <Option key={i}>
                  <H4
                    onClick={() => {
                      callback();
                      handleClose();
                    }}
                    sx={{
                      flex: 1,
                      alignItems: 'center',
                      display: 'flex',
                      fontWeight: 500,
                      padding: theme.spacing(2),
                      background:
                        symbol === activeToken
                          ? theme.palette.info.light
                          : 'none',
                    }}
                  >
                    {label}
                  </H4>
                </Option>
              ))}
            </Box>
          </InnerWrapper>
        </Drawer>
      </Box>
    );
  }
);

const Option = styled(Box)(
  () => `
    cursor: pointer;
    width: 100%;
    justify-content: flex-start;
    `
);

const InnerWrapper = styled(Box)(
  ({ theme }) => `
      width: 100%;
      margin-bottom: ${theme.spacing(4)};
  `
);

const DropdownButton = styled(Button)(
  ({ theme }) => `
  transition: none;
  width: 100%;
  text-transform: capitalize;
  justify-content: flex-start;
  border: ${theme.shape.borderStandard};
  background: ${theme.palette.common.white};
`
);
