import { Story, Meta } from '@storybook/react';
import { SwapIcon } from '@notional-finance/icons';
import { MiniButton, MiniButtonProps } from './mini-button';

export default {
  component: MiniButton,
  title: 'MiniButton',
} as Meta;

const Template: Story<MiniButtonProps> = (args) => {
  return <MiniButton {...args} />;
};

export const Max = Template.bind({});
Max.args = {
  label: 'MAX',
  isVisible: true,
};

export const UseWETH = Template.bind({});
UseWETH.args = {
  icon: SwapIcon,
  label: 'WETH',
  isVisible: true,
};
