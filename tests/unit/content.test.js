describe('URL Check in Content Script', () => {
  test('should only run script if URL starts with https://learn.microsoft.com/ja-jp/', () => {
    const currentUrl = 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview';
    expect(currentUrl.startsWith('https://learn.microsoft.com/ja-jp/')).toBe(true);
  });

  test('should not run script if URL does not start with https://learn.microsoft.com/ja-jp/', () => {
    const currentUrl = 'https://learn.microsoft.com/en-us/azure/virtual-machines/overview';
    expect(currentUrl.startsWith('https://learn.microsoft.com/ja-jp/')).toBe(false);
  });
  test('should match "年前に更新"', () => {
    const textContent = '2 年前に更新';
    const match = textContent.match(/(年|日|時間|分)前に更新|(今更新されたばかり)/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('年前に更新');
  });

  test('should match "日前に更新"', () => {
    const textContent = '3 日前に更新';
    const match = textContent.match(/(年|日|時間|分)前に更新|(今更新されたばかり)/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('日前に更新');
  });

  test('should match "時間前に更新"', () => {
    const textContent = '5 時間前に更新';
    const match = textContent.match(/(年|日|時間|分)前に更新|(今更新されたばかり)/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('時間前に更新');
  });

  test('should match "分前に更新"', () => {
    const textContent = '10 分前に更新';
    const match = textContent.match(/(年|日|時間|分)前に更新|(今更新されたばかり)/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('分前に更新');
  });

  test('should match "今更新されたばかり"', () => {
    const textContent = '今更新されたばかり';
    const match = textContent.match(/(年|日|時間|分)前に更新|(今更新されたばかり)/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('今更新されたばかり');
  });

  test('should not match unrelated text', () => {
    const textContent = 'This is some unrelated text';
    const match = textContent.match(/(年|日|時間|分)前に更新|(今更新されたばかり)/);
    expect(match).toBeNull();
  });

  test('should match "years ago"', () => {
    const textContent = '2 years ago';
    const match = textContent.match(/(years|days|hours|minutes) ago|just now/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('years ago');
  });

  test('should match "days ago"', () => {
    const textContent = '3 days ago';
    const match = textContent.match(/(years|days|hours|minutes) ago|just now/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('days ago');
  });

  test('should match "hours ago"', () => {
    const textContent = '5 hours ago';
    const match = textContent.match(/(years|days|hours|minutes) ago|just now/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('hours ago');
  });

  test('should match "minutes ago"', () => {
    const textContent = '10 minutes ago';
    const match = textContent.match(/(years|days|hours|minutes) ago|just now/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('minutes ago');
  });

  test('should match "just now"', () => {
    const textContent = 'just now';
    const match = textContent.match(/(years|days|hours|minutes) ago|just now/);
    expect(match).not.toBeNull();
    expect(match[0]).toBe('just now');
  });

  test('should not match unrelated text', () => {
    const textContent = 'This is some unrelated text';
    const match = textContent.match(/(years|days|hours|minutes) ago|just now/);
    expect(match).toBeNull();
  });
});

describe('DOM manipulation in content script', () => {
  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="article-metadata">
        <local-time datetime="2025-10-08T00:00:00.000Z"></local-time>
      </div>
      <div id="article-metadata-footer">
        <ul class="metadata page-metadata">
          <li class="visibility-hidden-visual-diff">
            <span class="badge">Last updated on 2025/10/08</span>
          </li>
        </ul>
      </div>
      <button data-theme-to="light" aria-pressed="true"></button>
    `;

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://learn.microsoft.com/ja-jp/test',
      },
      writable: true
    });

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('<html><body><local-time datetime="2025-11-26T00:00:00.000Z"></local-time></body></html>'),
      })
    );
  });

  test('should create and insert the custom header', async () => {
    // Run the content script
    require('../../src/content.js');

    // Wait for the async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the custom header was created
    const customHeader = document.getElementById('custom-header-from-article-metadata-footer');
    expect(customHeader).not.toBeNull();

    // Check if the custom header is in the correct position
    const articleMetadata = document.getElementById('article-metadata');
    expect(articleMetadata.nextElementSibling).toBe(customHeader);

    // Check if the update information is correct
    const updateInfo = customHeader.querySelector('p');
    expect(updateInfo).not.toBeNull();
    expect(updateInfo.innerHTML).toContain('英語版の更新日');
  });
});