const { test, expect, describe, beforeEach} = require('@playwright/test');
const { loginWith, createBlog, logOut } = require('./Helper')

describe('Blog List App', () => {
    beforeEach(async({page, request}) => {
        await request.post('/api/testing/reset')
        await request.post('/api/users', {
          data: {
            name: 'root',
            username: 'root',
            password: 'sekret'
          }
        })
        await request.post('/api/users', {
            data: {
            name: 'test',
            username: 'test',
            password: 'test'
            }
        })
        await page.goto('/')
    })

    test('Login page displayed', async ({ page }) => {
        const locator = await page.getByText('Please Login')
        await expect(locator).toBeVisible()
    })
    describe('Login', () =>{
        test('succeeds with correct credentials', async ({ page }) => {
            await loginWith(page,'root','sekret')
            await expect(page.getByText('root logged-in')).toBeVisible()
        })
        test('fails with wrong credentials', async ({ page }) => {
            await loginWith(page,'root','wrong')
            const notificationDiv = await page.locator('.notification')
            await expect(notificationDiv).toContainText('Wrong credentials')
            await expect(notificationDiv).toHaveCSS('border-style', 'solid')
            await expect(notificationDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
            // const errorDiv = await page.locator('.error')
            // await expect(page.getByText('wrong credentials')).toBeVisible()
            //await expect(page.locator('.error')).toContainText('wrong credentials')
           
        })
    })

    describe('when logged in', ()=>{
        beforeEach(async({page}) => {
            await loginWith(page,'root','sekret')
        })
       
        test('new blog can be created', async ({ page }) => {
            await createBlog(page,'test title', 'test author','www.testurl.com')
            const blogTitle = await page.getByText('test title', {exact : true})
            const blogTitleElement = await blogTitle.locator('..')
            await expect(blogTitleElement).toContainText('test title by test author')
            await expect(blogTitleElement).toBeVisible() 
        })

        describe('and three blogs exists',() => {
            beforeEach(async({page}) => {
                await createBlog(page,'first blog', 'first author','www.first.com')
                await createBlog(page,'second blog', 'second author','www.second.com')
                await createBlog(page,'third blog', 'third author','www.third.com')
            })  
            test('second blog can be liked', async ({ page }) => {
                const blogTitle = await page.getByText('second blog', {exact : true})
                const blogTitleElement = await blogTitle.locator('..')
                await blogTitleElement.getByTestId('viewbutton').click()
                await blogTitleElement.getByTestId('likebutton').click()
                await expect(blogTitleElement.locator('.blogLikes')).toContainText('1')
            })
            test('the user who added the blog can delete the blog', async ({ page }) => {
                page.on('dialog', async dialog => {
                    console.log(`Dialog message: ${dialog.message()}`);
                    await dialog.accept(); // or dialog.dismiss();
                }); 
              
                const blogTitleElement = await page.getByTestId('blogItem').nth(2)
                await blogTitleElement.getByTestId('viewbutton').click()
                await blogTitleElement.getByTestId('removebutton').click()
                await expect(page.getByTestId('blogItem').nth(2)).not.toBeVisible()

                // const blogTitle = await page.getByText('third blog', {exact : true})
                // const blogTitleElement = await blogTitle.locator('..')
                // await blogTitleElement.getByTestId('viewbutton').click()
                // await blogTitleElement.getByTestId('removebutton').click()
                // await expect(blogTitleElement.getByText('third blog')).not.toBeVisible()
            })

        })

        describe('blogs order',() => {
            beforeEach(async({page}) => {
                await createBlog(page,'first blog', 'first author','www.first.com')
                await createBlog(page,'second blog', 'second author','www.second.com')
                await createBlog(page,'third blog', 'third author','www.third.com')
            })  
            test('the blogs are arranged in the order according to the likes', async ({ page }) => {
                // await page.pause()
                const blogElements = await page.getByTestId('blogItem')
                await blogElements.nth(2).getByTestId('viewbutton').click()
                await blogElements.nth(2).getByTestId('likebutton').click()
                await expect(page.getByTestId('blogItem').nth(0).getByTestId('blogTitle')).toContainText('third blog')

                
            })
        })
        describe('user delete rights',() => {
            beforeEach(async({page}) => {
                await createBlog(page,'first blog', 'first author','www.first.com')
            })  
            test('only the user who added the blog sees the blogs remove button',async( {page}) => {
                const blogTitle = await page.getByText('first blog', {exact : true})
                const blogTitleElement = await blogTitle.locator('..')
                await blogTitleElement.getByTestId('viewbutton').click()
                await expect(blogTitleElement.getByTestId('removebutton')).toBeVisible()
                await logOut(page)
                await loginWith(page,'test','test')
                const blogTitleAfterUserChange = await page.getByText('first blog', {exact : true})
                const blogTitleElementAfterUserChange = await blogTitleAfterUserChange.locator('..')
                await blogTitleElementAfterUserChange.getByTestId('viewbutton').click()
                await expect(blogTitleElementAfterUserChange.getByTestId('removebutton')).not.toBeVisible()
            })  
        })
    })
   
})


