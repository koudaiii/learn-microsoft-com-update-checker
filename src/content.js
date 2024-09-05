// languageLabels is a dictionary that maps message from language codes to the corresponding language
const languageLabels = {
  'ja-jp': '英語版の更新日',
  // Add more language labels as needed
};

(async () => {
  // Get current URL
  const currentUrl = window.location.href;

  // Use a regular expression to extract the language code
  const languageCodeMatch = currentUrl.match(/https:\/\/learn\.microsoft\.com\/([^\/]+)\//);
  const currentLang = languageCodeMatch ? languageCodeMatch[1] : null;
  if (!currentLang) return;

  // Check if the page(https://learn.microsoft.com/en-us) is in en-us, if so, return
  const lang = 'en-us';
  if (currentLang === lang) return;

  const debug = new URLSearchParams(window.location.search).get("jp-learn-microsoft-com-update-checker-debug");

  // Get Japanese date element
  const japaneseDateElement = document.querySelector('time[data-article-date]');
  if (!japaneseDateElement) return;

  // Parse Japanese date
  const japaneseDateStr = japaneseDateElement.getAttribute("datetime");
  const japaneseDate = new Date(japaneseDateStr);

  // Translate URL to English
  const englishUrl = currentUrl.replace(`/${currentLang}/`, "/en-us/");

  try {
    // Get English page and parse update date
    const response = await fetch(englishUrl);
    const data = await response.text();

    // Parse HTML in English page
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");

    const englishDateStr = doc.querySelector('time[data-article-date]')?.getAttribute("datetime");
    if (!englishDateStr) return;
    const englishDate = new Date(englishDateStr);

    // Add update info to current page
    const updateInfo = document.createElement("p");
    japaneseDateElement.parentElement.appendChild(updateInfo);

    const updateClass = () => {
      // if theme is selected, apply appropriate text color based on theme
      const textColorClass = ((theme) => {
        if (theme === "dark") return "text-color-dark";
        if (theme === "high-contrast") return "text-color-high-contrast";
        if (theme === "light") return "text-color-light";
        return "text-color";
      })(document.querySelector('button[data-theme-to][aria-pressed="true"]').getAttribute("data-theme-to"));
      console.log("textColorClass:", textColorClass);

      // Add icon to update info
      informationIcon = "";

      console.log("English date:", englishDate);
      console.log("Japanese date:", japaneseDate);
      // Compare English date and Japanese date
      if (englishDate > japaneseDate || debug === "true") {
        // Display alert if English page is updated
        updateInfo.className = "alert is-primary"; // <class="alert is-primary"> is defined in CSS
        updateInfo.style.margin = "5px";
        updateInfo.style.padding = "10px";
        informationIcon = `<span class="icon"><span class="docon docon-status-error-outline" aria-hidden="true" style="margin: 0px"></span></span>`;
      } else {
        // Display info if English page is not updated
        updateInfo.style.marginTop = "0"; // <p> default margin-top is 1rem
        updateInfo.style.marginLeft = "3px"; // <p> default margin-left is 0
        updateInfo.className = textColorClass; // Apply appropriate text color based on theme
      }

      // Set update info text based on language
      const languageLabel = languageLabels[currentLang] || 'last updated on';

      // Display update info
      updateInfo.innerHTML = informationIcon + `${languageLabel}: <a href="${englishUrl}" target="_blank" class="${textColorClass}">${englishDate.toLocaleDateString(currentLang)}</a>`;
    }
    updateClass();
    const observer = new MutationObserver(updateClass);
    observer.observe(document.querySelector('button[data-theme-to][aria-pressed="true"]'), { attributes: true });
  } catch (error) {
    console.error("Error fetching English page:", error);
  }
})();
