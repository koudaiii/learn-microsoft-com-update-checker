/**
 * @jest-environment node
 */
const puppeteer = require('puppeteer');
const path = require('path');
const { time } = require('console');
const timezones = ['Asia/Tokyo', 'America/New_York', 'Europe/London']; // Add more timezones as needed

describe('learn.microsoft.com Update Checker E2E Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    const extensionPath = path.resolve(__dirname, '../../');
    browser = await puppeteer.launch({
      headless: process.env.GITHUB_ACTIONS === 'true',
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

  const testCases = [
    {
      url: 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview',
      prefersColorScheme: 'dark',
      themeColor: 'dark',
      expectedText: '英語版の更新日:',
      textElementSelector: 'p.text-color-dark'
    },
    {
      url: 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview',
      prefersColorScheme: 'light',
      themeColor: 'dark',
      expectedText: '英語版の更新日:',
      textElementSelector: 'p.text-color-dark'
    },
    {
      url: 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview',
      prefersColorScheme: 'dark',
      themeColor: 'light',
      expectedText: '英語版の更新日:',
      textElementSelector: 'p.text-color-light'
    },
    {
      url: 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview',
      prefersColorScheme: 'light',
      themeColor: 'light',
      expectedText: '英語版の更新日:',
      textElementSelector: 'p.text-color-light'
    },
    {
      url: 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview',
      prefersColorScheme: 'dark',
      themeColor: 'high-contrast',
      expectedText: '英語版の更新日:',
      textElementSelector: 'p.text-color-high-contrast'
    },
    {
      url: 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview',
      prefersColorScheme: 'light',
      themeColor: 'high-contrast',
      expectedText: '英語版の更新日:',
      textElementSelector: 'p.text-color-high-contrast'
    },
    {
      url: 'https://learn.microsoft.com/zh-cn/azure/virtual-machines/overview',
      prefersColorScheme: 'light',
      themeColor: 'light',
      expectedText: 'last updated on:',
      textElementSelector: 'p.text-color-light'
    }
  ];

  for (const timezone of timezones) {
    testCases.forEach((testCase) => {
      test(`should display English update date on ${testCase.url} with ${testCase.themeColor} theme in ${testCase.prefersColorScheme} mode`, async () => {
        await page.goto(testCase.url);
        await page.emulateMediaFeatures([
          { name: "prefers-color-scheme", value: testCase.prefersColorScheme },
        ]);
        await page.emulateTimezone(timezone);
        console.log("timezone:", timezone);

        // Click the button to set the theme to the desired color scheme
        await page.evaluate((themeColor) => {
          const themeButton = document.querySelector(`button[data-theme-to="${themeColor}"]`);
          themeButton.click();
        }, testCase.themeColor);
        await page.waitForSelector('button[aria-pressed="true"]');


        // Wait for the time element with the 'data-article-date' attribute to be added
        await page.waitForSelector('time[data-article-date]');

        const englishDateText = await page.evaluate((expectedText) => {
          return new Promise(resolve => setTimeout(resolve, 1000)) // Add a delay to allow time for the element to be added
            .then(() => {
              const paragraphs = Array.from(document.querySelectorAll('p'));
              const targetParagraph = paragraphs.find(p => p.textContent.includes(expectedText));
              return targetParagraph ? targetParagraph.innerText : null;
            });
        }, testCase.expectedText);
        expect(englishDateText).toMatch(testCase.expectedText);

        await page.waitForSelector(testCase.textElementSelector);

        const hasTextColorClass = await page.evaluate((textElementSelector) => {
          const textElement = document.querySelector(textElementSelector);
          return textElement !== null;
        }, testCase.textElementSelector);
        expect(hasTextColorClass).toBe(true);
      });

      test(`should not run script on en-us pages  with ${testCase.themeColor} theme in ${testCase.prefersColorScheme} mode`, async () => {
        await page.goto('https://learn.microsoft.com/en-us/azure/virtual-machines/overview');

        await page.emulateMediaFeatures([
          { name: "prefers-color-scheme", value: testCase.prefersColorScheme },
        ]);
        await page.emulateTimezone(timezone);
        console.log("timezone:", timezone);

        // Click the button to set the theme to the desired color scheme
        await page.evaluate((themeColor) => {
          const themeButton = document.querySelector(`button[data-theme-to="${themeColor}"]`);
          themeButton.click();
        }, testCase.themeColor);

        await page.waitForSelector('button[aria-pressed="true"]');

        const hasNotTextColorClass = await page.evaluate((textElementSelector) => {
          const textElement = document.querySelector(textElementSelector);
          return textElement === null;
        }, testCase.textElementSelector);
        expect(hasNotTextColorClass).toBe(true);
      });
    });

    test('should run script with jp-learn-microsoft-com-update-checker-debug flag', async () => {
      await page.goto('https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview?jp-learn-microsoft-com-update-checker-debug=true');
      await page.emulateTimezone(timezone);
      console.log("timezone:", timezone);

      // Wait for the paragraph element with the 'alert' class to be added
      await page.waitForSelector('p.alert');

      // alert is-primary class is added to the paragraph element
      const hasAlertIsPrimaryClass = await page.evaluate(() => {
        const updateInfoElement = document.querySelector('p.alert');
        return updateInfoElement ? updateInfoElement.classList.contains('is-primary') : false;
      });
      expect(hasAlertIsPrimaryClass).toBe(true);
    });
  };
});
