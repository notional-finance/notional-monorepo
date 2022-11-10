import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { getLanguageTranslation } from '@notional-finance/utils';
import App from './containers/App';

const onI18NError = (err) => {
  // Silence missing translation errors during development
  if (err.code === 'MISSING_TRANSLATION') return;
  console.error(err);
};

async function appInit() {
  const locale = navigator.language;
  const languageTranslation = await getLanguageTranslation(locale);

  ReactDOM.render(
    <IntlProvider
      locale={locale}
      defaultLocale="en"
      messages={languageTranslation}
      onError={onI18NError}
    >
      <App />
    </IntlProvider>,
    document.getElementById('root')
  );
}

appInit();
