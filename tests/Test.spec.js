import {test,expect}from 'playwright/test'
test ('practiceprogram',async({page}) => {

  await page.goto('https://demoapps.qspiders.com/ui?scenario=1');
  await page.getByPlaceholder('Enter your name').fill('Melvin')
  await page.getByPlaceholder('Enter Your Email').fill('melvingeorgedaniel@gmail.com')
  await page.getByPlaceholder('Enter your password').fill('Melvin@123')
  await page.getByRole('button',{name:'Register',exact:true}).click();

  await page.goto('https://demoapps.qspiders.com/ui/button?sublist=0');
  await page.getByRole('button',{name:'Yes'}).click()
  await expect
 (page.getByText('You selected "Yes"')
).toBeVisible();

await page.goto('https://demoapps.qspiders.com/ui/button/buttonRight?sublist=1');
await page.getByRole('button',{name:'Right Click'}).click({button:'right' })
await page.getByText('Yes').hover()
await page.locator('.py-1.ps-1', { hasText: 'Yes' }).click();

const message = page.getByText('You selected "Yes"',{exact:true});
//await expect(message).toBeVisible({timeout:10000});

});
//await page.pause();
