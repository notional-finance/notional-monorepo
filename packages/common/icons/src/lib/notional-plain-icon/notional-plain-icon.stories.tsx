import { Story, Meta } from '@storybook/react';
import { NotionalPlainIcon, NotionalPlainIconProps } from './notional-plain-icon';

export default {
  component: NotionalPlainIcon,
  title: 'NotionalPlainIcon',
} as Meta;

const Template: Story<NotionalPlainIconProps> = (args) => <NotionalPlainIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
