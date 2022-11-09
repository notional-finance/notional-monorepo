import { AddressButton, WalletSwitcher } from './wallet-switcher/wallet-switcher';
import { DarkModeToggle } from './dark-mode-toggle/dark-mode-toggle';
import { useAccount } from '@notional-finance/notionable-hooks';

export interface SettingsItem {
  key: string;
  active: boolean;
  label: string;
  CustomButton?: React.ElementType;
  ViewComponent?: React.ElementType;
  buttonText?: string;
}

export const useSettingsSideDrawer = () => {
  const { truncatedAddress } = useAccount();

  const walletAction = truncatedAddress
    ? {
        key: 'reset-wallets',
        active: false,
        label: 'Reset Wallets',
        CustomButton: AddressButton,
        ViewComponent: WalletSwitcher,
        buttonText: '',
      }
    : {
        key: 'connect-wallet',
        active: false,
        label: 'Connect Wallet',
        CustomButton: AddressButton,
        ViewComponent: WalletSwitcher,
        buttonText: '',
      };

  const accountData: SettingsItem[] = [
    // {
    //   key: 'notifications-settings',
    //   active: false,
    //   label: 'Notification & Reminder Settings',
    //   buttonText: 'Default',
    // },
    {
      key: 'language',
      active: false,
      label: 'Language',
      buttonText: 'English',
    },
    {
      key: 'privacy',
      active: false,
      label: 'Privacy',
      buttonText: 'Default',
    },
    {
      key: 'darkMode',
      active: false,
      label: 'Dark Mode',
      CustomButton: DarkModeToggle,
      buttonText: '',
    },
  ];

  accountData.unshift(walletAction);

  const transactionData: SettingsItem[] = [
    // {
    //   key: 'slippage-buffer',
    //   active: false,
    //   label: 'Slippage Buffer',
    //   buttonText: '0.1%',
    // },
    // {
    //   key: 'token-approval',
    //   active: false,
    //   label: 'Token Approval',
    //   buttonText: 'Unlimited',
    // },
    {
      key: 'base-currency',
      active: false,
      label: 'Base Currency',
      buttonText: '$USD',
    },
  ];

  return {
    accountData,
    transactionData,
  };
};

export default useSettingsSideDrawer;
