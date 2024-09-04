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
      const paragraphs = Array.from(document.querySelectorAll('p'));
      const targetParagraph = paragraphs.find(p => p.textContent.includes('英語版の更新日:'));
      return targetParagraph ? targetParagraph.innerText : null;
    });
    expect(englishDateText).toMatch(/英語版の更新日:/);

    // Wait for the paragraph element with the 'text-color-light' class to be added
    await page.waitForSelector('p.text-color-light');

    // text-color class is added to the paragraph element
    const hasTextColorClass = await page.evaluate(() => {
      const updateInfoElement = document.querySelector('p.text-color-light');
      return updateInfoElement ? updateInfoElement.classList.contains('text-color-light') : false;
    });
    expect(hasTextColorClass).toBe(true);
  });

  test('should not run script on non-ja-jp pages', async () => {
    await page.goto('https://learn.microsoft.com/en-us/azure/virtual-machines/overview');
    const japaneseDateElement = await page.$('time[aria-label="記事のレビュー日"]');
    expect(japaneseDateElement).toBeNull();
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
