// Configuration constants
const CONFIG = {
  DEFAULT_LANGUAGE: 'en-us',
  DOMAIN: 'learn.microsoft.com',
  URL_PATTERN: /https:\/\/learn\.microsoft\.com\/([^\/]+)\//,
  DEBUG_PARAM: 'jp-learn-microsoft-com-update-checker-debug',
  SELECTORS: {
    DATE_ELEMENT: 'local-time',
    THEME_BUTTON: 'button[data-theme-to][aria-pressed="true"]',
  },
  STYLES: {
    ALERT: {
      margin: '5px',
      padding: '10px',
    },
    INFO: {
      marginTop: '0',
      marginLeft: '3px',
    },
  },
  CLASSES: {
    ALERT: 'alert is-primary',
    THEMES: {
      dark: 'text-color-dark',
      'high-contrast': 'text-color-high-contrast',
      light: 'text-color-light',
      default: 'text-color',
    },
  },
  TIME_CONSTANTS: {
    MILLISECONDS_IN_MINUTE: 1000 * 60,
    MILLISECONDS_IN_HOUR: 1000 * 60 * 60,
    MILLISECONDS_IN_DAY: 1000 * 60 * 60 * 24,
    MILLISECONDS_IN_YEAR: 1000 * 60 * 60 * 24 * 365,
  },
};

// languageLabels is a dictionary that maps message from language codes to the corresponding language
// Default languageLabels is 'last updated on'
// Add more languageLabels as needed
const languageLabels = {
  'ja-jp': '英語版の更新日',
  // Add more language labels as needed. For example: 'fr-fr': 'Dernière mise à jour le',
};

// timeAgoLabels is a dictionary that maps message from language codes to the corresponding language
// Default timeAgoLabels is 'years ago', 'days ago', 'hours ago', 'minutes ago', 'just now'
// Add more timeAgoLabels as needed
const timeAgoLabels = {
  'ja-jp': {
  years: '年前に更新',
  days: '日前に更新',
  hours: '時間前に更新',
  minutes: '分前に更新',
  justNow: '今更新されたばかり',
  },
  // Add more language labels as needed. For example:
  // 'fr-fr': { years: 'il y a ans', days: 'il y a jours', hours: 'il y a heures', minutes: 'il y a minutes', justNow: 'à l\'instant' },
};

// Helper functions
const getLanguageFromUrl = (url) => {
  const match = url.match(CONFIG.URL_PATTERN);
  return match ? match[1] : null;
};

const getEnglishUrl = (url, currentLang) => {
  return url.replace(`/${currentLang}/`, `/${CONFIG.DEFAULT_LANGUAGE}/`);
};

const calculateTimeAgo = (timeDifference, currentLang) => {
  const { MILLISECONDS_IN_YEAR, MILLISECONDS_IN_DAY, MILLISECONDS_IN_HOUR, MILLISECONDS_IN_MINUTE } = CONFIG.TIME_CONSTANTS;

  const years = Math.floor(timeDifference / MILLISECONDS_IN_YEAR);
  const days = Math.floor((timeDifference % MILLISECONDS_IN_YEAR) / MILLISECONDS_IN_DAY);
  const hours = Math.floor((timeDifference % MILLISECONDS_IN_DAY) / MILLISECONDS_IN_HOUR);
  const minutes = Math.floor((timeDifference % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE);

  const labels = timeAgoLabels[currentLang] || {
    years: 'years ago',
    days: 'days ago',
    hours: 'hours ago',
    minutes: 'minutes ago',
    justNow: 'just now'
  };

  if (years > 0) {
    return ` ${years} ${labels.years}`;
  } else if (days > 0) {
    return ` ${days} ${labels.days}`;
  } else if (hours > 0) {
    return ` ${hours} ${labels.hours}`;
  } else if (minutes > 0) {
    return ` ${minutes} ${labels.minutes}`;
  } else {
    return labels.justNow;
  }
};

const getTextColorClass = (theme) => {
  return CONFIG.CLASSES.THEMES[theme] || CONFIG.CLASSES.THEMES.default;
};

const applyStyles = (element, styles) => {
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key] = value;
  });
};

(async () => {
  // Get current URL
  const currentUrl = window.location.href;

  // Use a regular expression to extract the language code
  const currentLang = getLanguageFromUrl(currentUrl);
  if (!currentLang) return;

  // Check if the page(https://learn.microsoft.com/en-us) is in en-us, if so, return
  if (currentLang === CONFIG.DEFAULT_LANGUAGE) return;

  const debug = new URLSearchParams(window.location.search).get(CONFIG.DEBUG_PARAM);

  // Get local-time tag in current page
  const dataArticleDateElement = document.querySelector(CONFIG.SELECTORS.DATE_ELEMENT);
  if (!dataArticleDateElement) return;

  // Parse article date
  const articleDateStr = dataArticleDateElement.getAttribute("datetime");
  const articleDate = new Date(articleDateStr);

  // Translate URL to English
  const englishUrl = getEnglishUrl(currentUrl, currentLang);

  try {
    // Get English page and parse update date
    const response = await fetch(englishUrl);
    const data = await response.text();

    // Parse HTML in English page
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");

    const englishDateStr = doc.querySelector(CONFIG.SELECTORS.DATE_ELEMENT)?.getAttribute("datetime");
    if (!englishDateStr) return;
    const englishDate = new Date(englishDateStr);

    // Add update info to current page
    // Calculate the difference in time between the current date and the English update date
    const currentDate = new Date();
    const timeDifference = currentDate - englishDate;

    // Create a new paragraph element to display the update information
    const timeAgo = calculateTimeAgo(timeDifference, currentLang);
    const timeAgoStr = ` (${timeAgo})`;

    const updateInfo = document.createElement("p");
    dataArticleDateElement.parentElement.appendChild(updateInfo);

    const updateClass = () => {
      // if theme is selected, apply appropriate text color based on theme
      const themeButton = document.querySelector(CONFIG.SELECTORS.THEME_BUTTON);
      const theme = themeButton.getAttribute("data-theme-to");
      const textColorClass = getTextColorClass(theme);
      console.log("textColorClass:", textColorClass);

      // Add icon to update info
      let informationIcon = "";

      console.log("English date:", englishDate);
      console.log("Article date:", articleDate);
      console.log("timeAgoStr:", timeAgoStr);

      // Compare English date and Article date
      if (englishDate > articleDate || debug === "true") {
        // Display alert if English page is updated
        updateInfo.className = CONFIG.CLASSES.ALERT;
        applyStyles(updateInfo, CONFIG.STYLES.ALERT);
        informationIcon = `<span class="icon"><span class="docon docon-status-error-outline" aria-hidden="true" style="margin: 0px"></span></span>`;
      } else {
        // Display info if English page is not updated
        applyStyles(updateInfo, CONFIG.STYLES.INFO);
        updateInfo.className = textColorClass; // Apply appropriate text color based on theme
      }

      // Set update info text based on language
      const languageLabel = languageLabels[currentLang] || 'last updated on';

      // Display update info
      updateInfo.innerHTML = informationIcon + `${languageLabel}: <a href="${englishUrl}" target="_blank" class="${textColorClass}">${englishDate.toLocaleDateString(currentLang)}${timeAgoStr}</a>`;
    }
    updateClass();
    const observer = new MutationObserver(updateClass);
    observer.observe(document.querySelector(CONFIG.SELECTORS.THEME_BUTTON), { attributes: true });
  } catch (error) {
    console.error("Error fetching English page:", error);
  }
})();
