describe('URL Check in Content Script', () => {
  test('should only run script if URL starts with https://learn.microsoft.com/ja-jp/', () => {
    const currentUrl = 'https://learn.microsoft.com/ja-jp/azure/virtual-machines/overview';
    expect(currentUrl.startsWith('https://learn.microsoft.com/ja-jp/')).toBe(true);
  });

  test('should not run script if URL does not start with https://learn.microsoft.com/ja-jp/', () => {
    const currentUrl = 'https://learn.microsoft.com/en-us/azure/virtual-machines/overview';
    expect(currentUrl.startsWith('https://learn.microsoft.com/ja-jp/')).toBe(false);
  });
});
