module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest"  // .js、.jsxファイルをBabelで変換
  },
  testTimeout: 20000, // 20 seconds
  testEnvironment: "jest-environment-jsdom"  // テスト環境を jsdom に設定
};
