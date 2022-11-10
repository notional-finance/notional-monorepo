import { Story, Meta } from '@storybook/react';
import { SwapIcon, SwapIconProps } from './swap-icon';

export default {
  component: SwapIcon,
  title: 'SwapIcon',
} as Meta;

const Template: Story<SwapIconProps> = (args) => <SwapIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
