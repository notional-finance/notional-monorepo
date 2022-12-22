import { Story, Meta } from '@storybook/react';
import { NotionalLogo, NotionalLogoProps } from './notional-logo';

export default {
  component: NotionalLogo,
  title: 'Notional Logo',
} as Meta;

const Template: Story<NotionalLogoProps> = (args) => <NotionalLogo {...args} />;

export const Default = Template.bind({});
Default.args = {};
