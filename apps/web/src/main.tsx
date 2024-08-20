import { IntlProvider } from 'react-intl';
import {
  getLanguageTranslation,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { createRoot } from 'react-dom/client';
import App from './containers/App';

const onI18NError = (err) => {
  // Silence missing translation errors during development
  if (err.code === 'MISSING_TRANSLATION') return;
  console.error(err);
};

async function appInit() {
  const { language } = getFromLocalStorage('userSettings');
  const locale = language || navigator.language;
  const languageTranslation = await getLanguageTranslation(locale);
  const container = document.getElementById('root');

  if (!container) throw new Error('Failed to find the root element');

  const root = createRoot(container);

  root.render(
    <IntlProvider
      locale={locale}
      defaultLocale="en"
      messages={languageTranslation}
      onError={onI18NError}
    >
      <App />
    </IntlProvider>
  );
}

appInit();
