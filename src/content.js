// Get current URL
const currentUrl = window.location.href;

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
          ? englishDateElement.innerText
          : null;

        if (englishDate) {
          // Add update info to Japanese page
          const updateInfo = document.createElement("p");
          updateInfo.className = "text-color"; // <class="text-color"> is defined in CSS
          updateInfo.style.marginTop = "0"; // <p> default margin-top is 1rem
          updateInfo.style.marginLeft = "1px"; // <p> default margin-left is 0
          updateInfo.innerHTML = `英語版の更新日: <a href="${englishUrl}" target="_blank" class="text-color">${englishDate}</a>`;
          japaneseDateElement.parentElement.appendChild(updateInfo);
        }
      })
      .catch((error) => {
        console.error("Error fetching English page:", error);
      });
  }
}
