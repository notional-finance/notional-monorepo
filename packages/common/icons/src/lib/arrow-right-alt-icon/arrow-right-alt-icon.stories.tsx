import { Story, Meta } from '@storybook/react';
import { ArrowRightAltIcon, ArrowRightAltIconProps } from './arrow-right-icon';

export default {
  component: ArrowRightAltIcon,
  title: 'ArrowRightAltIcon',
} as Meta;

const Template: Story<ArrowRightAltIconProps> = (args) => (
  <ArrowRightAltIcon {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
