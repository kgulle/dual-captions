let activeTabId;

const BUTTON_IDS = ['load-button', 'on-button', 'off-button'];
/**
 *
 * List from https://github.com/matheuss/google-translate-api/blob/master/languages.js
 *
 */
const SUPPORTED_LANGUAGES = {
  'auto': '- Detect Language -',
  'en': 'English',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'ny': 'Chichewa',
  'zh-cn': 'Chinese Simplified',
  'zh-tw': 'Chinese Traditional',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'tl': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'iw': 'Hebrew',
  'hi': 'Hindi',
  'hmn': 'Hmong',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ig': 'Igbo',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'ko': 'Korean',
  'ku': 'Kurdish (Kurmanji)',
  'ky': 'Kyrgyz',
  'lo': 'Lao',
  'la': 'Latin',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mn': 'Mongolian',
  'my': 'Myanmar (Burmese)',
  'ne': 'Nepali',
  'no': 'Norwegian',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ma': 'Punjabi',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan',
  'gd': 'Scots Gaelic',
  'sr': 'Serbian',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'Sindhi',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali',
  'es': 'Spanish',
  'su': 'Sundanese',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tg': 'Tajik',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zu': 'Zulu'
};

function getActiveTabId() {
  return new Promise((resolve, _) => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      const activeTab = tabs[0];
      if (activeTab) {
          activeTabId = activeTab.id;
      } else {
          activeTabId = 9999;
          // activeTabId is only used to indentify tab state in chrome.storage.local,
          // Not used for chrome.tabs.excuteScript()
      }
      resolve();
    });
  });
}

function initializeButton() {
  return new Promise((resolve, _) => {
    Promise.all([
      getValueInStorage(`DUAL_CAPTIONS-librariesLoaded-${activeTabId}`),
      getValueInStorage(`DUAL_CAPTIONS-captionsOn-${activeTabId}`)
    ]).then(values => {
      const librariesLoaded = values[0];
      const captionsOn = values[1];
      if (!librariesLoaded) {
        showButton('load-button');
      } else {
        if (captionsOn) {
          showButton('on-button');
        } else {
          showButton('off-button');
        }
      }
      resolve();
    });
  });
}

function initializeSelects() {
  return new Promise((resolve, _) => {
    const fromLanguageSelect = document.getElementById('from-select');
    const toLanguageSelect = document.getElementById('to-select');
    for (lang in SUPPORTED_LANGUAGES) {
      let option = document.createElement('option');
      option.value = lang;
      option.label = SUPPORTED_LANGUAGES[lang];
      fromLanguageSelect.appendChild(option);
      if (option.value !== 'auto') {
        toLanguageSelect.appendChild(option.cloneNode());
      }
    }
    Promise.all([
      getValueInStorage(`DUAL_CAPTIONS-fromLanguage-${activeTabId}`),
      getValueInStorage(`DUAL_CAPTIONS-toLanguage-${activeTabId}`)
    ]).then(values => {
      const fromLanguage = values[0];
      const toLanguage = values[1];
      if (fromLanguage) {
        fromLanguageSelect.value = fromLanguage;
      }
      if (toLanguage) {
        toLanguageSelect.value = toLanguage;
      }
      resolve();
    });
  });
}

function showButton(button) {
  BUTTON_IDS.forEach(buttonId => {
    if (button === buttonId) {
      document.getElementById(buttonId).removeAttribute('hidden');
    } else {
      document.getElementById(buttonId).setAttribute('hidden', true);
    }
  });
}

function startObserver() {
  return new Promise((resolve, _) => {
    chrome.tabs.executeScript(null, {code: `window.startObserver()`}, () => {
      resolve();
    });
  });
}

function stopObserver() {
  return new Promise((resolve, _) => {
    chrome.tabs.executeScript(null, {code: `window.stopObserver()`}, () => {
      resolve();
    });
  });
}

function navigateToIssuesPage() {
  return new Promise((resolve, _) => {
    chrome.tabs.executeScript(null, {code: `window.location.replace("https://github.com/mikesteele/dual-captions/issues")`}, () => {
      resolve();
    });
  });
}

function setListeners() {
  return new Promise((resolve, _) => {
    document.getElementById('load-button').addEventListener('click', () => {
      loadLibraries()
        .then(setValueInStorage(`DUAL_CAPTIONS-captionsOn-${activeTabId}`, true))
        .then(() => {
          showButton('on-button');
        });
    });
    document.getElementById('on-button').addEventListener('click', () => {
      stopObserver()
        .then(setValueInStorage(`DUAL_CAPTIONS-captionsOn-${activeTabId}`, false))
        .then(() => {
          showButton('off-button');
        });
    });
    document.getElementById('off-button').addEventListener('click', () => {
      startObserver()
        .then(setValueInStorage(`DUAL_CAPTIONS-captionsOn-${activeTabId}`, true))
        .then(() => {
          showButton('on-button');
        });
    });
    const fromLanguageSelect = document.getElementById('from-select');
    fromLanguageSelect.addEventListener('change', (e) => {
      setFromLanguage(fromLanguageSelect.options[fromLanguageSelect.selectedIndex].value)
        .then(() => {});
    });
    const toLanguageSelect = document.getElementById('to-select');
    toLanguageSelect.addEventListener('change', (e) => {
      setToLanguage(toLanguageSelect.options[toLanguageSelect.selectedIndex].value)
        .then(() => {});
    });
    const reportBugsLink = document.getElementById('report-bugs-link');
    reportBugsLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToIssuesPage()
        .then(() => {
          window.close();
        });
    });
    resolve();
  });
}

function setFromLanguage(language) {
  return new Promise((resolve, _) => {
    chrome.tabs.executeScript(null, {code: `window.setFromLanguage('${language}')`}, () => {
      setValueInStorage(`DUAL_CAPTIONS-fromLanguage-${activeTabId}`, language)
        .then(() => {
          resolve();
        });
    });
  })
}

function setToLanguage(language) {
  return new Promise((resolve, _) => {
    chrome.tabs.executeScript(null, {code: `window.setToLanguage('${language}')`}, () => {
      setValueInStorage(`DUAL_CAPTIONS-toLanguage-${activeTabId}`, language)
        .then(() => {
          resolve();
        });
    });
  })
}

function loadLibraries() {
  return new Promise((resolve, _) => {
    chrome.tabs.executeScript(null, {file: "lib/google-translate-token.js"}, () => {
      chrome.tabs.executeScript(null, {file: "lib/querystring-encode.js"}, () => {
        chrome.tabs.executeScript(null, {file: "lib/google-translate-api.js"}, () => {
          chrome.tabs.executeScript(null, {file: "lib/dual-captions.js"}, () => {
            setValueInStorage(`DUAL_CAPTIONS-librariesLoaded-${activeTabId}`, true)
              .then(() => {
                resolve();
              });
          });
        });
      });
    });
  });
}

function getValueInStorage(key) {
  return new Promise((resolve, _) => {
    chrome.storage.local.get(key, function(obj) {
      resolve(obj[key]);
    });
  });
}

function setValueInStorage(key, value) {
  return new Promise((resolve, _) => {
    let obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj, () => {
      resolve();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getActiveTabId()
    .then(initializeButton)
    .then(initializeSelects)
    .then(setListeners)
    .catch(() => {});
});
