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
