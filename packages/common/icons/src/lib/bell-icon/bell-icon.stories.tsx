import { Story, Meta } from '@storybook/react';
import { BellIcon, BellIconProps } from './bell-icon';

export default {
  component: BellIcon,
  title: 'BellIcon',
} as Meta;

const Template: Story<BellIconProps> = (args) => <BellIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
