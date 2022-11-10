export async function getLanguageTranslation(locale: string) {
  const localeCode = locale.toLowerCase();
  let importedTranslation;

  switch (localeCode) {
    case 'en-us' /* American English */:
      importedTranslation = await import(
        /* webpackMode: "eager" */ '@notional-finance/lang/english.json'
      );
      break;
    case 'zh' /* Chinese */:
      importedTranslation = await import(
        /* webpackMode: "eager" */ '@notional-finance/lang/chinese.json'
      );
      break;
    default:
      importedTranslation = await import(
        /* webpackMode: "eager" */ '@notional-finance/lang/english.json'
      );
      break;
  }

  const languageTranslation = importedTranslation.default;
  return languageTranslation;
}
