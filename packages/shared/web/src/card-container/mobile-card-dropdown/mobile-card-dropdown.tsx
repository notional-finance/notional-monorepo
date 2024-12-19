import { ReactNode, useEffect } from 'react';
import { useTheme, Box, styled, Drawer } from '@mui/material';
import { H4, SectionTitle } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { PRODUCTS } from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';
import useCardMobileNav from './use-card-mobile-nav';

export interface DrawerOptionProps {
  id: PRODUCTS;
  title: ReactNode;
  to: string;
  Icon: ReactNode;
}

interface MobileCardDropdownProps {
  activeToken: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileCardDropdown = observer(
  ({ activeToken, isOpen, setIsOpen }: MobileCardDropdownProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mobileNavOpen, setMobileNavOpen } = useAppStore();
    const { earnOptions, leveragedOptions, borrowOptions } = useCardMobileNav();

    useEffect(() => {
      if (!mobileNavOpen) {
        setIsOpen(false);
      }
    }, [mobileNavOpen, setIsOpen]);

    const handleClose = () => {
      setMobileNavOpen(false);
      setIsOpen(false);
    };

    return (
      <Drawer
        anchor="top"
        open={isOpen}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            marginTop: theme.spacing(9),
            height: '100vh',
            overflow: 'scroll',
            borderBottomLeftRadius: theme.shape.borderRadius(),
            borderBottomRightRadius: theme.shape.borderRadius(),
            border: theme.shape.borderStandard,
            background: theme.palette.background.default,
          },
        }}
      >
        <InnerWrapper id="inner-dropdown">
          <Box sx={{ margin: 'auto' }}>
            <SectionTitle
              msg={defineMessage({ defaultMessage: 'Earn Products' })}
              sx={{
                padding: theme.spacing(2),
                fontWeight: 600,
                color: theme.palette.typography.light,
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            />
            {earnOptions.map(({ title, to, Icon, id }, i) => (
              <Option
                key={i}
                onClick={() => {
                  handleClose();
                  navigate(to);
                }}
                sx={{
                  background:
                    id === activeToken ? theme.palette.info.light : 'none',
                }}
              >
                {Icon}
                <H4
                  onClick={() => {
                    handleClose();
                  }}
                  sx={{
                    flex: 1,
                    alignItems: 'center',
                    display: 'flex',
                    fontWeight: 500,
                  }}
                >
                  {title}
                </H4>
              </Option>
            ))}
          </Box>
          <Box sx={{ margin: 'auto' }}>
            <SectionTitle
              msg={defineMessage({ defaultMessage: 'Leverage Products' })}
              sx={{
                padding: theme.spacing(2),
                fontWeight: 600,
                color: theme.palette.typography.light,
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            />
            {leveragedOptions.map(({ title, to, Icon, id }, i) => (
              <Option
                key={i}
                onClick={() => {
                  handleClose();
                  navigate(to);
                }}
                sx={{
                  background:
                    id === activeToken ? theme.palette.info.light : 'none',
                }}
              >
                {Icon}
                <H4
                  onClick={() => {
                    handleClose();
                  }}
                  sx={{
                    flex: 1,
                    alignItems: 'center',
                    display: 'flex',
                    fontWeight: 500,
                  }}
                >
                  {title}
                </H4>
              </Option>
            ))}
          </Box>
          <Box sx={{ margin: 'auto' }}>
            <SectionTitle
              msg={defineMessage({ defaultMessage: 'Borrow Products' })}
              sx={{
                padding: theme.spacing(2),
                fontWeight: 600,
                color: theme.palette.typography.light,
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            />
            {borrowOptions.map(({ title, to, Icon, id }, i) => (
              <Option
                key={i}
                onClick={() => {
                  handleClose();
                  navigate(to);
                }}
                sx={{
                  background:
                    id === activeToken ? theme.palette.info.light : 'none',
                }}
              >
                {Icon}
                <H4
                  onClick={() => {
                    handleClose();
                  }}
                  sx={{
                    flex: 1,
                    alignItems: 'center',
                    display: 'flex',
                    fontWeight: 500,
                  }}
                >
                  {title}
                </H4>
              </Option>
            ))}
          </Box>
        </InnerWrapper>
      </Drawer>
    );
  }
);

const Option = styled(Box)(
  ({ theme }) => `
    cursor: pointer;
    width: 100%;
    justify-content: flex-start;
    display: flex;
    align-items: center;
    padding: ${theme.spacing(2)};
    svg {
      margin-right: ${theme.spacing(1)};
      height: ${theme.spacing(2.5)};
      width: ${theme.spacing(2.5)};
    }
    `
);

const InnerWrapper = styled(Box)(
  ({ theme }) => `
      width: 100%;
      margin-bottom: ${theme.spacing(4)};
  `
);
