import { Story, Meta } from '@storybook/react';
import { TradeActionButton, TradeActionButtonProps } from './trade-action-button';

export default {
  component: TradeActionButton,
  title: 'TradeActionButton',
} as Meta;

const Template: Story<TradeActionButtonProps> = (args) => <TradeActionButton {...args} />;

export const NoWalletConnected = Template.bind({});
NoWalletConnected.args = {
  isWalletConnected: false,
  canSubmit: false,
  walletSelect: () => console.log('click'),
  onSubmit: () => console.log('click'),
};

export const CannotSubmit = Template.bind({});
CannotSubmit.args = {
  isWalletConnected: true,
  canSubmit: false,
  walletSelect: () => console.log('click'),
  onSubmit: () => console.log('click'),
};

export const CanSubmit = Template.bind({});
CanSubmit.args = {
  isWalletConnected: true,
  canSubmit: true,
  walletSelect: () => console.log('click'),
  onSubmit: () => console.log('click'),
};
