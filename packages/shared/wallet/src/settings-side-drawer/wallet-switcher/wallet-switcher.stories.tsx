import { Story, Meta } from '@storybook/react';
import WalletSwitcher from './wallet-switcher';

export default {
  component: WalletSwitcher,
  title: 'Wallet Switcher',
} as Meta;

const Template: Story = (args) => <WalletSwitcher {...args} />;

export const Default = Template.bind({});
Default.args = {};
