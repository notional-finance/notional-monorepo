import { Story, Meta } from '@storybook/react';
import { CoinsIcon, CoinsIconProps } from './coins-icon';

export default {
  component: CoinsIcon,
  title: 'CoinsIcon',
} as Meta;

const Template: Story<CoinsIconProps> = (args) => <CoinsIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
