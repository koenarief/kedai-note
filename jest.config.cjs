module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/src/**/*.test.js", "**/src/**/*.test.jsx"],
  verbose: true,
  // jika ingin mock timers modern:
  fakeTimers: {
    "legacyFakeTimers": false
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  }
};
