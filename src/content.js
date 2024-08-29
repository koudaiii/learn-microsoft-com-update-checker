(async () => {
  // Get current URL
  const currentUrl = window.location.href;

  // Check if the page(https://learn.microsoft.com/ja-jp) is in Japanese
  const lang = 'ja-jp';
  if (!currentUrl.startsWith(`https://learn.microsoft.com/${lang}`)) return;

  const debug = new URLSearchParams(window.location.search).get("jp-learn-microsoft-com-update-checker-debug");

  // Translate URL to English
  const englishUrl = currentUrl.replace(`/${lang}/`, "/en-us/");

  // Get Japanese date element
  const japaneseDateElement = document.querySelector(
    'time[aria-label="記事のレビュー日"]'
  );

  if (!japaneseDateElement) return;
  const japaneseDate = new Date(japaneseDateElement.innerText);

  try {
    // Get English page and parse update date
    const response = await fetch(englishUrl);
    const data = await response.text();

    // Parse HTML in English page
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    const englishDateStr = doc.querySelector('time[aria-label="Article review date"]')?.getAttribute("datetime");

    if (!englishDateStr) return;

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

      const englishDate = new Date(englishDateStr);

      // Add icon to update info
      informationIcon = "";

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

      updateInfo.innerHTML = informationIcon + `英語版の更新日: <a href="${englishUrl}" target="_blank" class="${textColorClass}">${englishDate.toLocaleDateString(lang)}</a>`;
    }
    updateClass();
    const observer = new MutationObserver(updateClass);
    observer.observe(document.querySelector('button[data-theme-to][aria-pressed="true"]'), { attributes: true });
  } catch (error) {
    console.error("Error fetching English page:", error);
  }
})();