import { Story, Meta } from '@storybook/react';
import WalletSideDrawer from './wallet-side-drawer';

export default {
  component: WalletSideDrawer,
  title: 'Connect Wallet Sidebar',
} as Meta;

const Template: Story = (args) => <WalletSideDrawer {...args} />;

export const Default = Template.bind({});
Default.args = {};
