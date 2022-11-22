import {
  AddressButton,
  WalletSwitcher,
} from './wallet-switcher/wallet-switcher';
import { Privacy } from './privacy/privacy';
import { Language, LanguageButton } from './language/language';
import { DarkModeToggle } from './dark-mode-toggle/dark-mode-toggle';
import { useAccount } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
export interface SettingsItem {
  key: string;
  active: boolean;
  label: any;
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
        label: (
          <FormattedMessage
            defaultMessage="Reset Wallets"
            description={'Reset Wallets option title'}
          />
        ),
        CustomButton: AddressButton,
        ViewComponent: WalletSwitcher,
        buttonText: '',
      }
    : {
        key: 'connect-wallet',
        active: false,
        label: (
          <FormattedMessage
            defaultMessage="Connect Wallet"
            description={'Connect Wallet option title'}
          />
        ),
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
      label: (
        <FormattedMessage
          defaultMessage="Language"
          description={'Language option title'}
        />
      ),
      CustomButton: LanguageButton,
      ViewComponent: Language,
      buttonText: 'English',
    },
    {
      key: 'privacy',
      active: false,
      label: (
        <FormattedMessage
          defaultMessage="Privacy"
          description={'Privacy option title'}
        />
      ),
      ViewComponent: Privacy,
      buttonText: 'Default',
    },
    {
      key: 'darkMode',
      active: false,
      label: (
        <FormattedMessage
          defaultMessage="Dark Mode"
          description={'Dark Mode option title'}
        />
      ),
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
      label: (
        <FormattedMessage
          defaultMessage="Base Currency"
          description={'Base Currency option title'}
        />
      ),
      buttonText: '$USD',
    },
  ];

  return {
    accountData,
    transactionData,
  };
};

export default useSettingsSideDrawer;
