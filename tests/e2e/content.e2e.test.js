/**
 * @jest-environment node
 */
const puppeteer = require('puppeteer');
const path = require('path');

describe('JP Learn Microsoft.com Update Checker E2E Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    const extensionPath = path.resolve(__dirname, '../../');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ]
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('should display English update date on Japanese Microsoft Learn page', async () => {
    await page.goto('https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview');

    // Wait for the time element with the 'data-article-date' attribute to be added
    await page.waitForSelector('time[data-article-date]');

    const englishDateText = await page.evaluate(() => {
      return new Promise(resolve => setTimeout(resolve, 1000)) // Add a delay to allow time for the element to be added
        .then(() => {
          const paragraphs = Array.from(document.querySelectorAll('p'));
          const targetParagraph = paragraphs.find(p => p.textContent.includes('英語版の更新日:'));
          return targetParagraph ? targetParagraph.innerText : null;
        });
    });
    expect(englishDateText).toMatch(/英語版の更新日:/);
  });

  test('should display light theme when button[data-theme-to]=light and button[aria-pressed]=true', async () => {
    await page.goto('https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview');

    // Click the button to set the theme to light
    await page.evaluate(() => {
      const themeButton = document.querySelector('button[data-theme-to="light"]');
      themeButton.click();
    });
    await page.waitForSelector('button[aria-pressed="true"]');

    // Wait for the paragraph element with the 'text-color-light' class to be added
    await page.waitForSelector('p.text-color-light');

    const hasTextColorClass = await page.evaluate(() => {
      const textElement = document.querySelector('p.text-color-light');
      return textElement !== null;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should display dark theme when button[data-theme-to]=dark and button[aria-pressed]=true', async () => {
    await page.goto('https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview');

    // Click the button to set the theme to dark
    await page.evaluate(() => {
      const themeButton = document.querySelector('button[data-theme-to="dark"]');
      themeButton.click();
    });
    await page.waitForSelector('button[aria-pressed="true"]');

    // Wait for the paragraph element with the 'text-color-dark' class to be added
    await page.waitForSelector('p.text-color-dark');

    const hasTextColorClass = await page.evaluate(() => {
      const textElement = document.querySelector('p.text-color-dark');
      return textElement !== null;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should display high-contrast theme when button[data-theme-to]=high-contrast and button[aria-pressed]=true', async () => {
    await page.goto('https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview');

    // Click the button to set the theme to high-contrast
    await page.evaluate(() => {
      const themeButton = document.querySelector('button[data-theme-to="high-contrast"]');
      themeButton.click();
    });
    await page.waitForSelector('button[aria-pressed="true"]');

    // Wait for the paragraph element with the 'text-color-high-contrast' class to be added
    await page.waitForSelector('p.text-color-high-contrast');

    const hasTextColorClass = await page.evaluate(() => {
      const textElement = document.querySelector('p.text-color-high-contrast');
      return textElement !== null;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should not run script on non-ja-jp pages', async () => {
    await page.goto('https://learn.microsoft.com/en-us/azure/virtual-machines/overview');
    const japaneseDateElement = await page.$('time[aria-label="記事のレビュー日"]');
    expect(japaneseDateElement).toBeNull();
  });

  test('should not run script on en-us pages on light theme', async () => {
    await page.goto('https://learn.microsoft.com/en-us/azure/virtual-machines/overview');

    // Click the button to set the theme to light
    await page.evaluate(() => {
      const themeButton = document.querySelector('button[data-theme-to="light"]');
      themeButton.click();
    });
    await page.waitForSelector('button[aria-pressed="true"]');

    // Wait for the paragraph element with the 'text-color-light' class to be added
    await page.waitForSelector('p.text-color-light', { hidden: true });

    const hasTextColorClass = await page.evaluate(() => {
      const textElement = document.querySelector('p.text-color-light');
      return textElement === null;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should not run script on en-us pages on dark theme', async () => {
    await page.goto('https://learn.microsoft.com/en-us/azure/virtual-machines/overview');

    // Click the button to set the theme to dark
    await page.evaluate(() => {
      const themeButton = document.querySelector('button[data-theme-to="dark"]');
      themeButton.click();
    });
    await page.waitForSelector('button[aria-pressed="true"]');

    // Wait for the paragraph element with the 'text-color-dark' class to be added
    await page.waitForSelector('p.text-color-dark', { hidden: true });

    const hasTextColorClass = await page.evaluate(() => {
      const textElement = document.querySelector('p.text-color-dark');
      return textElement === null;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should not run script on en-us pages on high-contrast theme', async () => {
    await page.goto('https://learn.microsoft.com/en-us/azure/virtual-machines/overview');

    // Click the button to set the theme to high-contrast
    await page.evaluate(() => {
      const themeButton = document.querySelector('button[data-theme-to="high-contrast"]');
      themeButton.click();
    });
    await page.waitForSelector('button[aria-pressed="true"]');

    // Wait for the paragraph element with the 'text-color-high-contrast' class to be added
    await page.waitForSelector('p.text-color-high-contrast', { hidden: true });

    const hasTextColorClass = await page.evaluate(() => {
      const textElement = document.querySelector('p.text-color-high-contrast');
      return textElement === null;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should run script with jp-learn-microsoft-com-update-checker-debug flag', async () => {
    await page.goto('https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview?jp-learn-microsoft-com-update-checker-debug=true');

    // Wait for the paragraph element with the 'alert' class to be added
    await page.waitForSelector('p.alert');

    // alert is-primary class is added to the paragraph element
    const hasAlertIsPrimaryClass = await page.evaluate(() => {
      const updateInfoElement = document.querySelector('p.alert');
      return updateInfoElement ? updateInfoElement.classList.contains('is-primary') : false;
    });
    expect(hasAlertIsPrimaryClass).toBe(true);
  });
});
