/** @type {import('playwright').PlaywrightTestConfig} */
const config = {
  timeout: 60000,
  use: {
    headless: true,
  },
};

module.exports = config;
