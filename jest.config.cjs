module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.js", "**/src/**/*.test.jsx"],
  verbose: true,
  // jika ingin mock timers modern:
  fakeTimers: {
    "legacyFakeTimers": false
  }
};