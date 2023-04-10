import { Story, Meta } from '@storybook/react';
import { AlertIcon, AlertIconProps } from './alert-icon';

export default {
  component: AlertIcon,
  title: 'AlertIcon',
} as Meta;

const Template: Story<AlertIconProps> = (args) => <AlertIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
