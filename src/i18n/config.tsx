import i18next, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import locales from "./locales/locales.json";

const debug = Boolean(new URLSearchParams(window.location.search).get("debug"));

const resources: InitOptions["resources"] = {};

const data = import.meta.glob("./locales/*.json");

for (const path in data) {
  const code = path.replace(/^.*[\\/]/, "").replace(/\..*$/, "");
  if (!locales.some(e => e.includes(code))) {
    continue;
  }
  const short = code.replace(/-.*$/, "");
  const main = locales.filter(l => l.indexOf(short) === 0).length === 1;

  data[path]().then(mod => {
    const translation = JSON.parse(JSON.stringify(mod));

    if (!main) {
      resources[code] = { translation: translation };
    }
    resources[short] = { translation: translation };
  });
}

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: ["en-US", "en"],
    nonExplicitSupportedLngs: true,
    debug: debug,
  });

if (debug) {
  console.debug("language", i18next.language);
  console.debug("languages", i18next.languages);
}

export default i18next;
