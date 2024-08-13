const loginWith = async (page, username, password)  => {
    await page.getByTestId('Username').fill(username)
    await page.getByTestId('Password').fill(password)
    await page.getByTestId('Login').click()
}
const logOut = async (page)  => {
    await page.getByTestId('Logout').click()
    await page.getByText('Please Login').waitFor() 
}
const createBlog = async (page, title, author, url)  => {
    await page.getByRole('button', { name: 'create new blog' }).click()
    await page.getByTestId('Title').fill(title)
    await page.getByTestId('Author').fill(author)
    await page.getByTestId('Url').fill(url)
    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText(title, {exact : true}).waitFor() 
}

export { loginWith, createBlog, logOut }