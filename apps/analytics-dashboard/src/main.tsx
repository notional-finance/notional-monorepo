import { StrictMode } from 'react';
// @ts-ignore
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// @ts-ignore
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
