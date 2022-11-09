import { Story, Meta } from '@storybook/react';
import { CheckmarkIcon, CheckmarkIconProps } from './checkmark-icon';

export default {
  component: CheckmarkIcon,
  title: 'CheckmarkIcon',
} as Meta;

const Template: Story<CheckmarkIconProps> = (args) => <CheckmarkIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
