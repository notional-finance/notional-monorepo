import { Story, Meta } from '@storybook/react';
import { CountUp } from './count-up';

export default {
  component: CountUp,
  title: 'CountUp',
} as Meta;

const Template: Story = (args) => <CountUp {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
