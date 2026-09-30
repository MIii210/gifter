import assert from 'node:assert/strict';
import playwright from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
const {chromium} = playwright;

const baseURL = process.env.CALENDAR_BROWSER_URL || 'http://terminal.local:4173/';
const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
const page = await browser.newPage({viewport: {width: 390, height: 844}});
try {
  await page.goto(`${baseURL}#home`, {waitUntil: 'domcontentloaded', timeout: 30000});
  await page.locator('button[aria-label="展开日历"]').click();
  const initial = await page.locator('[aria-label$="日历"]').evaluate((calendar) => ({
    viewMonth: calendar.getAttribute('data-view-month'),
    selectedDate: calendar.getAttribute('data-selected-date'),
  }));
  assert.deepEqual(initial, {viewMonth: '8', selectedDate: ''}, '初始为无选中日的月视图');
  const button = page.locator('button[aria-label="9月29日"]');
  assert.equal(await button.count(), 1, '9月29日应只有一个日期按钮');
  await button.evaluate((node) => node.click());
  await page.waitForTimeout(80);
  const result = await page.locator('main').evaluate((main) => ({
    region: main.querySelector('[aria-label$="日历"]')?.getAttribute('aria-label'),
    viewMonth: main.querySelector('[aria-label$="日历"]')?.getAttribute('data-view-month'),
    selectedDate: main.querySelector('[aria-label$="日历"]')?.getAttribute('data-selected-date'),
    pressed: main.querySelector('button[aria-label="9月29日"]')?.getAttribute('aria-pressed'),
    selected: main.querySelectorAll('button.day.selected').length,
    status: main.querySelector('[role="status"]')?.textContent?.trim(),
  }));
  assert.equal(result.region, '2026年9月日历');
  assert.equal(result.viewMonth, '8');
  assert.equal(result.selectedDate, '2026-09-29');
  assert.equal(result.pressed, 'true');
  assert.equal(result.selected, 1);
  assert.equal(result.status, '往事不可追，看看近期安排～');
  await page.waitForTimeout(250);
  const stable = await page.locator('[aria-label$="日历"]').evaluate((calendar) => ({
    region: calendar.getAttribute('aria-label'),
    viewMonth: calendar.getAttribute('data-view-month'),
    selectedDate: calendar.getAttribute('data-selected-date'),
  }));
  assert.deepEqual(stable, {region: '2026年9月日历', viewMonth: '8', selectedDate: '2026-09-29'});
  await page.locator('button[aria-label="9月29日"]').evaluate((node) => node.click());
  const noToggle = await page.locator('[aria-label$="日历"]').evaluate((calendar) => ({
    viewMonth: calendar.getAttribute('data-view-month'),
    selectedDate: calendar.getAttribute('data-selected-date'),
  }));
  assert.deepEqual(noToggle, {viewMonth: '8', selectedDate: '2026-09-29'});
  console.log('PASS: browser DOM button.click() keeps 2026年9月, selects 9月29日, and shows historical prompt.');
} finally {
  await browser.close();
}
