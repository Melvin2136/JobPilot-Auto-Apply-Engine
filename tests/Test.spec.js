import {test,expect} from '@playwright/test'

test('Dropdown',async({page})=>{

await page.goto('https://demoapps.qspiders.com/ui/dropdown?sublist=0');

await page .getByText('Checkout Page').toBeVisible();

await page.getByRole('country_code').nth(1).click()
await page.getByPlaceholder('enter your number').fill('9074569824');
    page.getByRole('radio', { name: "Male" }).click()

await page.locator('#select3').click();

})