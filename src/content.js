// Get current URL
const currentUrl = window.location.href;
const debug = new URLSearchParams(window.location.search).get("jp-learn-microsoft-com-update-checker-debug");

// Check if the page(https://learn.microsoft.com/ja-jp) is in Japanese
if (currentUrl.startsWith("https://learn.microsoft.com/ja-jp/")) {
  // Translate URL to English
  const englishUrl = currentUrl.replace("/ja-jp/", "/en-us/");

  // Get Japanese date element
  const japaneseDateElement = document.querySelector(
    'time[aria-label="記事のレビュー日"]'
  );

  if (japaneseDateElement) {
    // Get English page and parse update date
    fetch(englishUrl)
      .then((response) => response.text())
      .then((data) => {
        // Parse HTML in English page
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const englishDateElement = doc.querySelector(
          'time[aria-label="Article review date"]'
        );
        const englishDate = englishDateElement
          ? new Date(englishDateElement.innerText)
          : null;

        if (englishDate) {
          // Get Japanese date
          const japaneseDate = new Date(japaneseDateElement.innerText);

          // Check for theme based on data-theme-to and aria-pressed="true"
          const selectedThemeButton = document.querySelector('button[data-theme-to][aria-pressed="true"]');

          // Set default browser text color
          textColorClass = "text-color";

          // if theme is selected, apply appropriate text color based on theme
          if (selectedThemeButton) {
            const themeAttribute = selectedThemeButton.getAttribute('data-theme-to');
            if (themeAttribute === "dark") {
              textColorClass = "text-color-dark";
            } else if (themeAttribute === "high-contrast") {
              textColorClass = "text-color-high-contrast";
            } else if (themeAttribute === "light") {
              textColorClass = "text-color-light";
            }
          }

          // Add update info to current page
          const updateInfo = document.createElement("p");

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
          updateInfo.innerHTML = informationIcon + `英語版の更新日: <a href="${englishUrl}" target="_blank" class="${textColorClass}">${englishDate.toLocaleDateString()}</a>`;
          japaneseDateElement.parentElement.appendChild(updateInfo);
        }
      })
      .catch((error) => {
        console.error("Error fetching English page:", error);
      });
  }
}
