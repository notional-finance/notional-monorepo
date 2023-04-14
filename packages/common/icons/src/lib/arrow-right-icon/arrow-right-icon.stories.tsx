import { Story, Meta } from '@storybook/react';
import { ArrowRightIcon, ArrowRightIconProps } from './arrow-right-icon';

export default {
  component: ArrowRightIcon,
  title: 'ArrowRightIcon',
} as Meta;

const Template: Story<ArrowRightIconProps> = (args) => (
  <ArrowRightIcon {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
