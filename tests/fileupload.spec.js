import { test, expect } from '@playwright/test';

test('Run all field', async ({ page }) => {
    
//   await page.goto('https://the-internet.herokuapp.com/upload');

//   await page.locator('#drag-drop-upload')
//     .setInputFiles('C:/Users/melvi/Downloads/Kelvin.pdf');

//   await page.waitForTimeout(2000);

await page.goto('https://www.google.com/');

await page.locator('[name="q"]').fill('Playwright');

await page.waitForSelector('ul[role="listbox"]');

await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');

})
