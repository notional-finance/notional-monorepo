import { Story, Meta } from '@storybook/react';
import { LaunchIcon, LaunchIconProps } from './launch-icon';

export default {
  component: LaunchIcon,
  title: 'LaunchIcon',
} as Meta;

const Template: Story<LaunchIconProps> = (args) => <LaunchIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
