export async function getLanguageTranslation(locale: string) {
  const localeCode = locale?.toLowerCase()
  let importedTranslation;
  
  switch (localeCode) {
    case 'en_us' /* American English */:
      importedTranslation = await import(
        /* webpackMode: "eager" */ './lang/en.json'
      );
      break;
    case 'zh-cn' /* Chinese */:
      importedTranslation = await import(
        /* webpackMode: "eager" */ './lang/zh-cn.json'
      );
      break;
    case 'ja' /* Japanese */:
      importedTranslation = await import(
        /* webpackMode: "eager" */ './lang/ja.json'
      );
      break;
    default:
      importedTranslation = await import(
        /* webpackMode: "eager" */ './lang/en.json'
      );
      break;
  }

  const languageTranslation = importedTranslation.default;
  return languageTranslation;
}
