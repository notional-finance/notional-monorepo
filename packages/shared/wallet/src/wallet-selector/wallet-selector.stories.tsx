import { Story, Meta } from '@storybook/react';
import WalletSelector from './wallet-selector';

export default {
  component: WalletSelector,
  title: 'Wallet Selector',
} as Meta;

const Template: Story = (args) => <WalletSelector {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
