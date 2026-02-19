import{test,expect}from'playwright/test';
test('Login page validation',async({page})=>{

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

    await page.getByPlaceholder('username').fill('Admin');
    await page.locator('[name="password"]').fill('admin123');
    await page.locator('[type="submit"]').click();


    //await page.waitForTimeout(4000);
    
     await expect (page).toHaveURL(/dashboard/)

     await page.getByAltText("profile picture").first().click()
    
     await page.getByText('Logout').click()

     //await page.waitForTimeout(5000)

     await expect (page).toHaveURL(/login/)
    
})

