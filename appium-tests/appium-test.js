/**
 * Appium Test Entry Point
 */
import { runAppiumTestSuite } from './tests/app-login-tests.js';

runAppiumTestSuite().catch(err => {
  console.error('Appium runner error:', err);
  process.exit(1);
});
