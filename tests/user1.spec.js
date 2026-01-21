import {test}from '@playwright/test'
test('firstprogram',async({page})=>{

    await page.goto('https://demoapps.qspiders.com/ui/dropdown?sublist=0')
    await page.locator('#country_code').selectOption('+01')
    await page.getByPlaceholder('enter your number').fill('9074569824');

})