import { Story, Meta } from '@storybook/react';
import Privacy from './privacy';

export default {
  component: Privacy,
  title: 'Privacy',
} as Meta;

const Template: Story = (args) => <Privacy {...args} />;

export const Default = Template.bind({});
Default.args = {};
