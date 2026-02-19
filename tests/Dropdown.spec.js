import {test,expect}from'@playwright/test'
test('Verifing Dropdown',async({page})=>{

await page.goto('https://www.globalsqa.com/demo-site/select-dropdown-menu/')

await page.locator('select').selectOption({value:"AFG"});
//await page.waitForTimeout(3000)
await page.locator('select').selectOption({value:"BEL"});
//await page.waitForTimeout(3000)
await page.locator('select').selectOption({value:"BEN"});
//await page.waitForTimeout(3000)
await page.locator('select').selectOption({value:"BOL"});

const value =await page.locator('select').textContent()

console.log("all dropdown value"+value);

//await page.locator('select').tohavevalue('Egypt')

await expect (value.includes('Egypt')).toBeTruthy()

});