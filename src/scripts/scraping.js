import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto('https://fullfiller.gusalbukrk.com');

await page.setViewport({ width: 1080, height: 1024 });

await page.locator('#input').fill('harry potter');

await page.locator('#format-h').click();
await page.locator('#button-generate').click();

const textarea = await page.locator('#output:not(.bg-light-gray)').waitHandle();

const text = await textarea.evaluate((el) => el.textContent);

console.log(text);

await browser.close();
