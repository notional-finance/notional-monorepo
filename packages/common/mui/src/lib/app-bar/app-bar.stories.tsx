import { Story, Meta } from '@storybook/react';
import { Toolbar } from '@mui/material';
import { NotionalLogo } from '@notional-finance/styles';
import { AppBar, AppBarProps } from './app-bar';

export default {
  component: AppBar,
  title: 'AppBar',
} as Meta;

const Template: Story<AppBarProps> = (args) => (
  <AppBar {...args}>
    <Toolbar>
      <NotionalLogo />
    </Toolbar>
  </AppBar>
);

export const Dark = Template.bind({});
Dark.args = {
  position: 'static',
};

export const Light = Template.bind({});
Light.args = {
  position: 'static',
};
