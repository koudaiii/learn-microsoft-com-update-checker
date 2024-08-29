const puppeteer = require('puppeteer');
const path = require('path');

/**
 * @jest-environment node
 */


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

    await page.waitForSelector('time[aria-label="記事のレビュー日"]');

    const englishDateText = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('p'));
      const targetParagraph = paragraphs.find(p => p.textContent.includes('英語版の更新日:'));
      return targetParagraph ? targetParagraph.innerText : null;
    });
    expect(englishDateText).toMatch(/英語版の更新日:/);

    // text-color class is added to the paragraph element
    const hasTextColorClass = await page.evaluate(() => {
      const updateInfoElement = document.querySelector('p.text-color');
      return updateInfoElement ? updateInfoElement.classList.contains('text-color') : false;
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

    // alert is-primary class is added to the paragraph element
    const hasAlertIsPrimaryClass = await page.evaluate(() => {
      const updateInfoElement = document.querySelector('p.alert.is-primary');
      return updateInfoElement ? updateInfoElement.classList.contains('alert') : false;
    });

    expect(hasAlertIsPrimaryClass).toBe(true);
  });

});
