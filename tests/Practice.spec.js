
//   // Navigate to the signup page
//   await page.goto('https://app.playonereal.com/agent-signup');

//   // Wait for the visible page title (paragraph with "Create Account" text)
//   await expect(page.getByRole('paragraph').filter({ hasText: 'Create Account' })).toBeVisible({ timeout: 15000 });

//   // Fill the form fields
//   await page.getByPlaceholder('Enter your first name').fill('Melvin');
//   await page.getByPlaceholder('Enter your last name').fill('George');
//   await page.getByPlaceholder('eg. johndoe9').fill('melvingeorge9');
//   await page.getByPlaceholder('johndoe@example.com').fill('melvingeorgedaniel@gmail.com');
//   await page.getByPlaceholder('Choose password').fill('Melvin@1234');
//   await page.getByPlaceholder('Confirm password').fill('Melvin@1234');
 
//   // Handle checkboxes
//   const checkboxes = page.locator('input[type="checkbox"]');
//   const total = await checkboxes.count();

//   for (let i = 0; i < total; i++) {
//     await checkboxes.nth(i).check();
//   }

//   // Submit the form
//   await page.getByRole('button', { name: 'Create Account' }).click();

//   // Verify successful signup by checking for a welcome message or dashboard element
//   await expect(page.getByText('Welcome, Melvin', { exact: false })).toBeVisible();
// });


// test.only ('Interview test', async ({ page }) => {

// await page.goto('https://demoapps.qspiders.com/ui/checkbox?sublist=0')

// await page.getByRole('checkbox', { name: '' }).nth(0).check();

// await page.locator('#domain_b').check();

// await page.pause()

// })

// import { test } from '@playwright/test'

// test('windowhandle', async ({ browser }) => {

//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto('https://demoapps.qspiders.com/ui/browser?sublist=0');

//   const [newPage] = await Promise.all([
//     context.waitForEvent('page'),
//     page.getByRole('button', { name: 'view more' }).first().click()
//   ]);

//   await newPage.getByRole('button',{name:'Add to Cart'}).click()

//   let pages = await context.pages()
//   console.log(pages.lenght);

//   let title1 = await pages[0].title()
//   console.log(title1);

//   let title2 = await pages[1].title()
//   console.log(title2);

//   await pages[0].bringToFront()
//   await pages[1].close()

//   await page.pause()

//   // Optionally interact with the newly opened page:
//   // await newPage.waitForLoadState();
// });